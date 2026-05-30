const { withGeminiRotation } = require('../config/gemini');
const { withGroqRotation } = require('../config/groq');
const { GoogleAIFileManager, FileState } = require('@google/generative-ai/server');
const fs = require('fs');
const os = require('os');
const path = require('path');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const parseGeminiJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error(`Failed to parse Gemini JSON. Raw: ${text.substring(0, 200)}`);
  }
};

const normalizeAnalysis = (parsed, provider) => ({
  transcript: parsed.transcript || '',
  skills: Array.isArray(parsed.skills) ? parsed.skills : [],
  experienceSummary: parsed.experienceSummary || '',
  communicationScore:
    typeof parsed.communicationScore === 'number'
      ? Math.min(10, Math.max(0, Math.round(parsed.communicationScore)))
      : 0,
  confidenceIndicators: parsed.confidenceIndicators || '',
  aiSummary: parsed.aiSummary || '',
  careerRecommendations: parsed.careerRecommendations || null,
  modelUsed: provider,
  analysisMode: parsed._analysisMode || 'unknown',
});

// ─── STEP 1: Communication Analysis via Groq ─────────────────────────────────
// Groq: 14,400 req/day, 30 RPM — handles this easily

const analyzeCommuncation = async (transcript) => {
  const prompt = `You are an expert communication coach analyzing a candidate's video resume speech.

Transcript: "${transcript}"

Analyze the communication quality and return ONLY a valid JSON object:
{
  "communicationScore": <integer 1-10>,
  "tone": "<one of: confident, hesitant, enthusiastic, nervous, professional, casual>",
  "fillerWordCount": <integer>,
  "fillerWords": ["<word1>", "<word2>"],
  "confidenceIndicators": "<2 sentences of specific feedback on delivery>",
  "strengths": "<1 sentence on what they did well>",
  "improvement": "<1 sentence on what to improve>"
}

Score guide:
9-10: Exceptionally clear, well-structured, minimal fillers, specific examples
7-8: Clear and organized, good vocabulary, minor hesitations  
5-6: Understandable but some rambling or filler words
3-4: Difficult to follow, disorganized
1-2: Barely communicative

If transcript is empty or too short, return score 0.`;

  return withGroqRotation(async (client) => {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
    return JSON.parse(completion.choices[0].message.content);
  });
};

// ─── STEP 2: Skill Extraction via Gemini ─────────────────────────────────────
// Gemini: reserved ONLY for this structured JSON extraction task

const extractSkillsFromTranscript = async (transcript, commAnalysis) => {
  const prompt = `You are an expert HR analyst. Extract professional information from this candidate's speech transcript.

Transcript: "${transcript}"
Communication tone: ${commAnalysis.tone || 'unknown'}

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "skills": ["<skill1>", "<skill2>", "<skill3>"],
  "experienceSummary": "<2-3 sentences describing experience level and background>",
  "aiSummary": "<A compelling 2-line professional summary in third person>",
  "jobTitles": ["<most suitable job title 1>", "<most suitable job title 2>", "<most suitable job title 3>"]
}

Extract real, specific skills mentioned. If transcript is empty, return empty arrays.`;

  return withGeminiRotation(async (genAI) => {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: 'You are an expert HR analyst. Always respond with valid JSON only.',
    });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });
    return parseGeminiJSON(result.response.text());
  });
};

// ─── STEP 3: Career Recommendations via Groq ─────────────────────────────────

const generateCareerRecommendations = async (skills, aiSummary) => {
  if (!skills || skills.length === 0) return null;

  const prompt = `You are a career development AI advisor. Based on this candidate profile, provide career guidance.

Skills: ${skills.join(', ')}
Summary: ${aiSummary || 'No summary available'}

Return ONLY a valid JSON object:
{
  "topJobCategories": ["<category1>", "<category2>", "<category3>"],
  "skillsToLearn": ["<high-value skill 1>", "<high-value skill 2>"],
  "careerAdvice": "<1 sentence of actionable career direction advice>",
  "salaryPotential": "<estimated salary range based on skills>"
}`;

  try {
    return await withGroqRotation(async (client) => {
      const completion = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      });
      return JSON.parse(completion.choices[0].message.content);
    });
  } catch (err) {
    console.warn('⚠️  Career recommendations failed (non-critical):', err.message?.substring(0, 80));
    return null;
  }
};

// ─── PRIMARY: Full transcript analysis pipeline ───────────────────────────────

/**
 * Analyze a candidate from their speech transcript.
 * Pipeline: Groq (comm) → Gemini (skills JSON) → Groq (career recs)
 * @param {string} transcript
 * @returns {Promise<Object>} normalized analysis object
 */
const analyzeTranscript = async (transcript) => {
  if (!transcript || transcript.trim().length < 10) {
    return normalizeAnalysis({
      transcript: transcript || '',
      skills: [],
      experienceSummary: '',
      communicationScore: 0,
      confidenceIndicators: 'Insufficient speech detected.',
      aiSummary: 'No meaningful speech was captured.',
      _analysisMode: 'transcript-empty',
    }, 'none');
  }

  // Step 1: Communication analysis (Groq — fast, unlimited)
  let commAnalysis = { communicationScore: 5, tone: 'unknown', confidenceIndicators: '', fillerWordCount: 0 };
  try {
    console.log('🎤 Step 1: Communication analysis via Groq...');
    commAnalysis = await analyzeCommuncation(transcript);
    console.log(`✅ Communication score: ${commAnalysis.communicationScore}/10, tone: ${commAnalysis.tone}`);
  } catch (err) {
    console.warn('⚠️  Groq comm analysis failed, using defaults:', err.message?.substring(0, 80));
  }

  // Step 2: Skill extraction (Gemini — JSON only, reserved quota)
  let skillData = { skills: [], experienceSummary: '', aiSummary: '', jobTitles: [] };
  try {
    console.log('🧠 Step 2: Skill extraction via Gemini...');
    skillData = await extractSkillsFromTranscript(transcript, commAnalysis);
    console.log(`✅ Extracted ${skillData.skills?.length || 0} skills`);
  } catch (err) {
    console.warn('⚠️  Gemini skill extraction failed:', err.message?.substring(0, 80));
    // Fallback: try Groq for skill extraction if Gemini fails
    try {
      console.log('🔄 Fallback: Skill extraction via Groq...');
      skillData = await withGroqRotation(async (client) => {
        const completion = await client.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{
            role: 'user',
            content: `Extract skills from this transcript and return JSON with skills[], experienceSummary, aiSummary, jobTitles[]. Transcript: "${transcript}"`
          }],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        });
        return JSON.parse(completion.choices[0].message.content);
      });
      console.log(`✅ Fallback Groq extracted ${skillData.skills?.length || 0} skills`);
    } catch (fallbackErr) {
      console.warn('⚠️  Groq fallback also failed:', fallbackErr.message?.substring(0, 80));
    }
  }

  // Step 3: Career recommendations (Groq — non-blocking, fails gracefully)
  let careerRecs = null;
  try {
    console.log('🚀 Step 3: Career recommendations via Groq...');
    careerRecs = await generateCareerRecommendations(skillData.skills, skillData.aiSummary);
  } catch (_) {}

  return normalizeAnalysis({
    transcript,
    skills: skillData.skills || [],
    experienceSummary: skillData.experienceSummary || '',
    communicationScore: commAnalysis.communicationScore || 0,
    confidenceIndicators: commAnalysis.confidenceIndicators || commAnalysis.strengths || '',
    aiSummary: skillData.aiSummary || '',
    careerRecommendations: careerRecs,
    _analysisMode: 'transcript-split',
  }, 'groq+gemini');
};

// ─── FALLBACK: Full video analysis via Gemini File API ───────────────────────
// Only used when browser Speech API is unavailable (Firefox/Safari)

const uploadBufferToGeminiFileApi = async (videoBuffer, mimeType, apiKey) => {
  const extMap = {
    'video/webm': 'webm', 'video/mp4': 'mp4', 'video/quicktime': 'mov',
    'video/x-msvideo': 'avi', 'video/ogg': 'ogv',
  };
  const ext = extMap[mimeType] || 'webm';
  const tmpPath = path.join(os.tmpdir(), `hv_${Date.now()}.${ext}`);

  fs.writeFileSync(tmpPath, videoBuffer);
  console.log(`📤 Uploading ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB to Gemini File API...`);

  try {
    const fileManager = new GoogleAIFileManager(apiKey);
    const uploadResult = await fileManager.uploadFile(tmpPath, {
      mimeType,
      displayName: `video_resume_${Date.now()}`,
    });

    let file = uploadResult.file;
    let attempts = 0;
    while (file.state === FileState.PROCESSING && attempts < 30) {
      await sleep(3000);
      file = await fileManager.getFile(file.name);
      attempts++;
    }

    if (file.state !== FileState.ACTIVE) {
      throw new Error(`Gemini file processing failed — state: ${file.state}`);
    }

    console.log('✅ Gemini file ready:', file.uri);
    return file.uri;
  } finally {
    try { fs.unlinkSync(tmpPath); } catch (_) {}
  }
};

const analyzeVideo = async (videoBuffer, mimeType = 'video/webm') => {
  const prompt = `Analyze this video resume. Return ONLY a valid JSON object:
{
  "transcript": "<Complete verbatim transcript>",
  "skills": ["<skill1>", "<skill2>"],
  "experienceSummary": "<2-3 sentences>",
  "communicationScore": <integer 1-10>,
  "confidenceIndicators": "<brief assessment>",
  "aiSummary": "<2-line professional summary in third person>"
}`;

  return withGeminiRotation(async (genAI, apiKey) => {
    // 1. Upload using the specific key for this rotation
    const fileUri = await uploadBufferToGeminiFileApi(videoBuffer, mimeType, apiKey);

    // 2. Generate content using the same key's client
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: 'You are an expert HR analyst. Always respond with valid JSON only.',
    });
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ fileData: { mimeType, fileUri } }, { text: prompt }],
      }],
      generationConfig: { responseMimeType: 'application/json' },
    });
    const parsed = parseGeminiJSON(result.response.text());
    parsed._analysisMode = 'video';
    return normalizeAnalysis(parsed, 'gemini-video');
  });
};

// ─── Match Explanation via Groq ───────────────────────────────────────────────
// Moved from Gemini → Groq to preserve Gemini quota

const generateMatchExplanation = async (candidateSkills, jobSkills, score) => {
  const prompt = `Write ONE sentence explaining why this candidate fits (or doesn't fit) this job.
Candidate skills: ${candidateSkills.join(', ')}
Job requires: ${jobSkills.join(', ')}
Match score: ${score}%
Be specific about skill overlap and gaps. No generic phrases.`;

  try {
    return await withGroqRotation(async (client) => {
      const completion = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a precise hiring recommendation engine. One sentence only. No fluff.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 120,
      });
      return completion.choices[0].message.content.trim().replace(/^"|"$/g, '');
    });
  } catch (err) {
    console.warn('⚠️  Match explanation Groq failed, using rule-based fallback');
    // Rule-based fallback — cannot fail
    const matched = candidateSkills.filter((s) =>
      jobSkills.some((j) => j.toLowerCase() === s.toLowerCase())
    );
    const missing = jobSkills.filter(
      (j) => !candidateSkills.some((s) => s.toLowerCase() === j.toLowerCase())
    );
    return matched.length > 0
      ? `Strong in ${matched.join(', ')}${missing.length ? '. Gaps: ' + missing.join(', ') : '. Full coverage.'}`
      : `Limited overlap. Missing: ${missing.join(', ')}.`;
  }
};

// ─── AI Interview Assistant (Phase 2) ────────────────────────────────────────

/**
 * Generate 5 interview questions for a job using Groq
 */
const generateInterviewQuestions = async (jobTitle, jobDescription, skillsRequired) => {
  const prompt = `You are an expert technical interviewer. Generate exactly 5 interview questions for this role.

Job Title: ${jobTitle}
Description: ${jobDescription}
Required Skills: ${skillsRequired.join(', ')}

Return ONLY a valid JSON object:
{
  "questions": [
    { "id": 1, "question": "<question text>", "type": "<behavioral|technical|situational>", "hint": "<what a good answer covers>" },
    { "id": 2, "question": "<question text>", "type": "<type>", "hint": "<hint>" },
    { "id": 3, "question": "<question text>", "type": "<type>", "hint": "<hint>" },
    { "id": 4, "question": "<question text>", "type": "<type>", "hint": "<hint>" },
    { "id": 5, "question": "<question text>", "type": "<type>", "hint": "<hint>" }
  ]
}

Mix: 2 technical, 2 behavioral, 1 situational. Make them specific to the role.`;

  return withGroqRotation(async (client) => {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.6,
    });
    return JSON.parse(completion.choices[0].message.content);
  });
};

/**
 * Evaluate candidate answers to interview questions using Groq
 */
const evaluateInterviewAnswers = async (questions, answers, jobTitle) => {
  const qa = questions.map((q, i) => ({
    question: q.question,
    answer: answers[i] || '(no answer provided)',
    hint: q.hint,
  }));

  const prompt = `You are an expert interviewer evaluating a candidate for a ${jobTitle} position.

Evaluate these question-answer pairs:
${JSON.stringify(qa, null, 2)}

Return ONLY a valid JSON object:
{
  "evaluations": [
    { "questionId": 1, "rating": <1-5>, "feedback": "<1 sentence specific improvement advice>" },
    { "questionId": 2, "rating": <1-5>, "feedback": "<feedback>" },
    { "questionId": 3, "rating": <1-5>, "feedback": "<feedback>" },
    { "questionId": 4, "rating": <1-5>, "feedback": "<feedback>" },
    { "questionId": 5, "rating": <1-5>, "feedback": "<feedback>" }
  ],
  "overallReadinessScore": <integer 1-100>,
  "overallFeedback": "<2 sentences summarizing their readiness>",
  "topStrength": "<their best quality shown in answers>",
  "mainGap": "<biggest area to improve>"
}`;

  return withGroqRotation(async (client) => {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
    return JSON.parse(completion.choices[0].message.content);
  });
};

// ─── Skill Assessment Quiz (Phase 3) ─────────────────────────────────────────

/**
 * Generate a 5-question MCQ quiz for a specific skill using Groq
 */
const generateSkillQuiz = async (skill) => {
  const prompt = `Generate a 5-question multiple choice quiz to test knowledge of "${skill}".

Return ONLY a valid JSON object:
{
  "skill": "${skill}",
  "questions": [
    {
      "id": 1,
      "question": "<question text>",
      "options": ["A. <option>", "B. <option>", "C. <option>", "D. <option>"],
      "correctAnswer": "<A|B|C|D>",
      "explanation": "<why this is correct>"
    }
  ]
}

Requirements:
- 5 questions total
- Vary difficulty: 2 basic, 2 intermediate, 1 advanced
- Options must be clearly labeled A, B, C, D
- Make questions practical and relevant to real-world usage`;

  return withGroqRotation(async (client) => {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });
    return JSON.parse(completion.choices[0].message.content);
  });
};

module.exports = {
  analyzeTranscript,
  analyzeVideo,
  generateMatchExplanation,
  generateCareerRecommendations,
  generateInterviewQuestions,
  evaluateInterviewAnswers,
  generateSkillQuiz,
};
