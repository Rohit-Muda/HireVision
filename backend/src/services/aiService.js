const { getGenAI } = require('../config/gemini');
const { GoogleAIFileManager, FileState } = require('@google/generative-ai/server');
const fs = require('fs');
const os = require('os');
const path = require('path');

// ─── Model fallback chain ────────────────────────────────────────────────────
// Ordered by availability on current API key.
// gemini-2.5-flash: ✅ CONFIRMED WORKING on this key
// gemini-2.5-flash-lite: Lightweight backup (lower quota consumption)
// gemini-2.0-flash: Fallback (may be quota-limited on free tier projects)
const TEXT_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite-preview-06-17',
  'gemini-2.0-flash',
];

// ─── System prompts ──────────────────────────────────────────────────────────

const SYSTEM_INSTRUCTION = `You are an expert HR analyst and career coach. You analyze video resumes with deep attention to both content and delivery. You are fair, unbiased, and provide constructive assessments. Always respond with valid JSON only, no markdown formatting, no code blocks.`;

const TRANSCRIPT_ANALYSIS_PROMPT = `You are given the verbatim transcript from a candidate's 60-second video resume. Analyze it carefully.

Return a JSON object with these exact fields:
{
  "skills": ["<skill1>", "<skill2>", "<skill3>"],
  "experienceSummary": "<2-3 sentences describing their experience level and background>",
  "communicationScore": <integer 1-10>,
  "confidenceIndicators": "<brief assessment of clarity, structure, and communication quality based on the transcript>",
  "aiSummary": "<A compelling 2-line professional summary in third person. Example: 'Experienced React developer with 3 years of hands-on project work. Demonstrates strong problem-solving ability and clear communication style.'>"
}

Scoring guide for communicationScore (judge from the transcript text quality):
- 9-10: Exceptionally clear, well-structured sentences, minimal filler words, specific examples
- 7-8: Clear and organized, good vocabulary, minor hesitations or fillers
- 5-6: Understandable but some rambling, noticeable filler words or vague statements
- 3-4: Difficult to follow, very short, disorganized, or mostly filler
- 1-2: Barely communicative, single words or incoherent

If the transcript is empty or too short to analyze, return skills as empty array and score as 0.`;

const VIDEO_ANALYSIS_PROMPT = `Analyze this candidate's video resume carefully. Watch their delivery, listen to their content, and evaluate both what they say and how they say it.

Return a JSON object with these exact fields:
{
  "transcript": "<Complete verbatim transcript of everything the candidate said>",
  "skills": ["<skill1>", "<skill2>", "<skill3>"],
  "experienceSummary": "<2-3 sentences describing their experience level and background>",
  "communicationScore": <integer 1-10>,
  "confidenceIndicators": "<brief assessment of confidence, clarity, pacing>",
  "aiSummary": "<A compelling 2-line professional summary in third person.>"
}

Scoring guide for communicationScore:
- 9-10: Exceptional clarity, confident tone, well-structured, minimal filler words
- 7-8: Clear and organized, good pace, minor hesitations
- 5-6: Understandable but some rambling, noticeable filler words
- 3-4: Difficult to follow, very short or disorganized
- 1-2: Barely communicative, single words or silence

If the video has no speech, return empty transcript and score of 0.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const parseRetryDelay = (errorMessage) => {
  const match = errorMessage?.match(/retry\s*in\s*(\d+(?:\.\d+)?)\s*s/i);
  return match ? Math.ceil(parseFloat(match[1]) * 1000) + 2000 : 25000;
};

const isQuotaError = (err) => {
  const msg = err?.message || '';
  return msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')
    || msg.includes('RESOURCE_EXHAUSTED');
};

const parseGeminiJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error(`Failed to parse Gemini response as JSON. Raw: ${text.substring(0, 200)}`);
  }
};

const normalizeAnalysis = (parsed, modelName) => ({
  transcript: parsed.transcript || '',
  skills: Array.isArray(parsed.skills) ? parsed.skills : [],
  experienceSummary: parsed.experienceSummary || '',
  communicationScore:
    typeof parsed.communicationScore === 'number'
      ? Math.min(10, Math.max(0, Math.round(parsed.communicationScore)))
      : 0,
  confidenceIndicators: parsed.confidenceIndicators || '',
  aiSummary: parsed.aiSummary || '',
  modelUsed: modelName,
  analysisMode: parsed._analysisMode || 'unknown',
  error: parsed.error || null,
});

// ─── Singleton FileManager ────────────────────────────────────────────────────
let _fileManager = null;
const getFileManager = () => {
  if (!_fileManager) {
    _fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
  }
  return _fileManager;
};

// ─── PRIMARY: Text-only transcript analysis (~200-500 tokens) ─────────────────
// This is 100x cheaper than video analysis and works with free tier easily.

/**
 * Analyze a candidate from their speech transcript (text-only).
 * Uses ~200-500 input tokens vs ~50,000+ for video.
 * @param {string} transcript - verbatim speech text captured via Web Speech API
 * @returns {Promise<Object>} analysis object
 */
const analyzeTranscript = async (transcript) => {
  if (!transcript || transcript.trim().length < 10) {
    return normalizeAnalysis({
      transcript: transcript || '',
      skills: [],
      experienceSummary: '',
      communicationScore: 0,
      confidenceIndicators: 'Insufficient speech detected.',
      aiSummary: 'No meaningful speech was captured in the video.',
      _analysisMode: 'transcript-empty',
    }, 'none');
  }

  const genAI = getGenAI();
  const prompt = `Here is the candidate's speech transcript from their 60-second video resume:\n\n"${transcript}"\n\n${TRANSCRIPT_ANALYSIS_PROMPT}`;

  const errors = [];
  for (const modelName of TEXT_MODELS) {
    try {
      console.log(`📝 Analyzing transcript with ${modelName} (~${prompt.length} chars)...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      });

      const text = result.response.text();
      console.log(`✅ ${modelName} responded (transcript analysis)`);

      const parsed = parseGeminiJSON(text);
      parsed.transcript = transcript; // keep the original transcript
      parsed._analysisMode = 'transcript';
      return normalizeAnalysis(parsed, modelName);
    } catch (err) {
      errors.push({ model: modelName, error: err.message });
      console.warn(`⚠️  ${modelName} failed: ${err.message.substring(0, 120)}`);

      if (isQuotaError(err)) {
        const delay = parseRetryDelay(err.message);
        console.log(`   ⏳ Quota hit on ${modelName}, waiting ${(delay / 1000).toFixed(0)}s...`);
        await sleep(delay);
      }
    }
  }

  const errorSummary = errors.map(e => `${e.model}: ${e.error.substring(0, 80)}`).join(' | ');
  throw new Error(`All Gemini models exhausted for transcript analysis. ${errorSummary}`);
};

// ─── FALLBACK: Full video analysis (expensive, ~50K tokens) ───────────────────
// Only used if browser Speech API is unavailable (Firefox, Safari).

const uploadBufferToGeminiFileApi = async (videoBuffer, mimeType) => {
  const extMap = {
    'video/webm': 'webm', 'video/mp4': 'mp4', 'video/quicktime': 'mov',
    'video/x-msvideo': 'avi', 'video/ogg': 'ogv',
  };
  const ext = extMap[mimeType] || 'webm';
  const tmpPath = path.join(os.tmpdir(), `hv_${Date.now()}.${ext}`);

  fs.writeFileSync(tmpPath, videoBuffer);
  console.log(`📤 Uploading ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB to Gemini File API...`);

  try {
    const fileManager = getFileManager();
    const uploadResult = await fileManager.uploadFile(tmpPath, {
      mimeType,
      displayName: `video_resume_${Date.now()}`,
    });

    let file = uploadResult.file;
    console.log(`📂 Gemini file state: ${file.state}, waiting for ACTIVE...`);

    let attempts = 0;
    while (file.state === FileState.PROCESSING && attempts < 30) {
      await sleep(3000);
      file = await fileManager.getFile(file.name);
      attempts++;
      console.log(`   ⏳ Attempt ${attempts}: ${file.state}`);
    }

    if (file.state !== FileState.ACTIVE) {
      throw new Error(`Gemini file processing failed — state: ${file.state} after ${attempts} attempts`);
    }

    console.log('✅ Gemini file ready:', file.uri);
    return file.uri;
  } finally {
    try { fs.unlinkSync(tmpPath); } catch (_) {}
  }
};

/**
 * Full video analysis via Gemini File API (expensive).
 * Use only when transcript is not available.
 */
const analyzeVideo = async (videoBuffer, mimeType = 'video/webm') => {
  const genAI = getGenAI();
  const fileUri = await uploadBufferToGeminiFileApi(videoBuffer, mimeType);

  const errors = [];
  for (const modelName of TEXT_MODELS) {
    try {
      console.log(`🎬 Trying video analysis with ${modelName}...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { fileData: { mimeType, fileUri } },
            { text: VIDEO_ANALYSIS_PROMPT },
          ],
        }],
        generationConfig: { responseMimeType: 'application/json' },
      });

      const text = result.response.text();
      console.log(`✅ ${modelName} responded (video analysis)`);

      const parsed = parseGeminiJSON(text);
      parsed._analysisMode = 'video';
      return normalizeAnalysis(parsed, modelName);
    } catch (err) {
      errors.push({ model: modelName, error: err.message });
      console.warn(`⚠️  ${modelName} failed: ${err.message.substring(0, 120)}`);

      if (isQuotaError(err)) {
        const delay = parseRetryDelay(err.message);
        console.log(`   ⏳ Quota hit on ${modelName}, waiting ${(delay / 1000).toFixed(0)}s...`);
        await sleep(delay);
      }
    }
  }

  const errorSummary = errors.map(e => `${e.model}: ${e.error.substring(0, 80)}`).join(' | ');
  throw new Error(`All Gemini models exhausted. Quota resets at midnight PT. ${errorSummary}`);
};

// ─── Match Explanation (with fallback) ────────────────────────────────────────

const generateMatchExplanation = async (candidateSkills, jobSkills, score) => {
  const genAI = getGenAI();

  const prompt = `Generate a one-sentence hiring recommendation.
Candidate skills: ${candidateSkills.join(', ')}
Job requires: ${jobSkills.join(', ')}
Match percentage: ${score}%
Be specific about strengths and gaps. Do not be generic.`;

  for (const modelName of TEXT_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction:
          'You are a hiring recommendation engine. Be concise, specific, and honest. One sentence only.',
      });

      const result = await model.generateContent(prompt);
      return result.response.text().trim().replace(/^"|"$/g, '');
    } catch (err) {
      if (isQuotaError(err)) {
        console.warn(`⚠️  ${modelName} quota hit for match explanation, trying next...`);
        await sleep(5000);
        continue;
      }
      throw err;
    }
  }

  // Fallback: rule-based explanation (no AI needed)
  const matched = candidateSkills.filter(s => jobSkills.some(j => j.toLowerCase() === s.toLowerCase()));
  const missing = jobSkills.filter(j => !candidateSkills.some(s => s.toLowerCase() === j.toLowerCase()));
  return matched.length > 0
    ? `Strong in ${matched.join(', ')}${missing.length ? '. Gaps: ' + missing.join(', ') : '. Full coverage.'}`
    : `Limited overlap. Missing: ${missing.join(', ')}.`;
};

module.exports = { analyzeTranscript, analyzeVideo, generateMatchExplanation };
