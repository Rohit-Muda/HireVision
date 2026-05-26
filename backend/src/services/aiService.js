const { getGenAI } = require('../config/gemini');
const { GoogleAIFileManager, FileState } = require('@google/generative-ai/server');
const fs = require('fs');
const os = require('os');
const path = require('path');

const SYSTEM_INSTRUCTION = `You are an expert HR analyst and career coach. You analyze video resumes with deep attention to both content and delivery. You are fair, unbiased, and provide constructive assessments. Always respond with valid JSON only, no markdown formatting, no code blocks.`;

const VIDEO_ANALYSIS_PROMPT = `Analyze this candidate's video resume carefully. Watch their delivery, listen to their content, and evaluate both what they say and how they say it.

Return a JSON object with these exact fields:
{
  "transcript": "<Complete verbatim transcript of everything the candidate said>",
  "skills": ["<skill1>", "<skill2>", "<skill3>"],
  "experienceSummary": "<2-3 sentences describing their experience level and background>",
  "communicationScore": <integer 1-10>,
  "confidenceIndicators": "<brief assessment of confidence, clarity, pacing>",
  "aiSummary": "<A compelling 2-line professional summary in third person. Example: 'Experienced React developer with 3 years of hands-on project work. Demonstrates strong problem-solving ability and clear communication style.'>"
}

Scoring guide for communicationScore:
- 9-10: Exceptional clarity, confident tone, well-structured, minimal filler words
- 7-8: Clear and organized, good pace, minor hesitations
- 5-6: Understandable but some rambling, noticeable filler words
- 3-4: Difficult to follow, very short or disorganized
- 1-2: Barely communicative, single words or silence

If the video has no speech, return empty transcript and score of 0.`;

// Singleton FileManager to avoid re-creating on every request
let _fileManager = null;
const getFileManager = () => {
  if (!_fileManager) {
    _fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
  }
  return _fileManager;
};

/**
 * Upload a video buffer to the Gemini File API.
 * Gemini's fileData part ONLY accepts generativelanguage.googleapis.com URIs.
 * Firebase Storage URLs are NOT supported by Gemini multimodal input.
 * @param {Buffer} videoBuffer
 * @param {string} mimeType
 * @returns {Promise<string>} Gemini file URI
 */
const uploadBufferToGeminiFileApi = async (videoBuffer, mimeType) => {
  const extMap = {
    'video/webm': 'webm',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    'video/ogg': 'ogv',
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

    // Poll until ACTIVE (Gemini processes asynchronously)
    let attempts = 0;
    while (file.state === FileState.PROCESSING && attempts < 30) {
      await new Promise((r) => setTimeout(r, 3000));
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
 * Analyze a video resume using Gemini 2.5 Flash.
 * @param {Buffer} videoBuffer - raw video bytes (from multer memoryStorage)
 * @param {string} mimeType - video MIME type
 * @returns {Promise<Object>} analysis object
 */
const analyzeVideo = async (videoBuffer, mimeType = 'video/webm') => {
  const genAI = getGenAI();

  // Upload buffer to Gemini File API to get a valid fileUri
  const fileUri = await uploadBufferToGeminiFileApi(videoBuffer, mimeType);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          { fileData: { mimeType, fileUri } },
          { text: VIDEO_ANALYSIS_PROMPT },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const text = result.response.text();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error(`Failed to parse Gemini response as JSON. Raw: ${text.substring(0, 200)}`);
    }
  }

  return {
    transcript: parsed.transcript || '',
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    experienceSummary: parsed.experienceSummary || '',
    communicationScore:
      typeof parsed.communicationScore === 'number'
        ? Math.min(10, Math.max(0, Math.round(parsed.communicationScore)))
        : 0,
    confidenceIndicators: parsed.confidenceIndicators || '',
    aiSummary: parsed.aiSummary || '',
    error: parsed.error || null,
  };
};

/**
 * Generate a match explanation using Gemini
 */
const generateMatchExplanation = async (candidateSkills, jobSkills, score) => {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction:
      'You are a hiring recommendation engine. Be concise, specific, and honest. One sentence only.',
  });

  const prompt = `Generate a one-sentence hiring recommendation.
Candidate skills: ${candidateSkills.join(', ')}
Job requires: ${jobSkills.join(', ')}
Match percentage: ${score}%
Be specific about strengths and gaps. Do not be generic.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim().replace(/^"|"$/g, '');
};

module.exports = { analyzeVideo, generateMatchExplanation };
