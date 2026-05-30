const { withGeminiRotation } = require('../config/gemini');
const { withGroqRotation } = require('../config/groq');
const axios = require('axios');

// ─── Constants ───────────────────────────────────────────────────────────────

const COHERE_EMBED_URL = 'https://api.cohere.com/v1/embed';
const HF_EMBED_URL = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2';

// ─── Primary: Cohere embed-english-v3.0 (1024-dim) ───────────────────────────

const cohereEmbed = async (texts) => {
  const response = await axios.post(
    COHERE_EMBED_URL,
    {
      texts: Array.isArray(texts) ? texts : [texts],
      model: 'embed-english-v3.0',
      input_type: 'search_document',
      embedding_types: ['float'],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );
  return response.data.embeddings.float[0];
};

// ─── Fallback: Hugging Face all-MiniLM-L6-v2 (384-dim) ──────────────────────

const hfEmbed = async (text) => {
  const response = await axios.post(
    HF_EMBED_URL,
    { inputs: text, options: { wait_for_model: true } },
    {
      headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` },
      timeout: 20000,
    }
  );
  // HF returns nested array for batch; unwrap for single input
  const result = response.data;
  return Array.isArray(result[0]) ? result[0] : result;
};

// ─── Final fallback: Gemini text-embedding-004 (768-dim) ─────────────────────

const geminiEmbed = async (text) => {
  return withGeminiRotation(async (genAI) => {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  });
};

/**
 * Generate an embedding vector from text.
 * Priority: Cohere → HuggingFace → Gemini
 * @param {string} text
 * @returns {Promise<number[]>}
 */
const generateEmbedding = async (text) => {
  if (!text || text.trim().length === 0) return [];

  // 1. Try Cohere first
  if (process.env.COHERE_API_KEY) {
    try {
      const vec = await cohereEmbed(text);
      console.log(`✅ Embedding via Cohere (${vec.length}-dim)`);
      return vec;
    } catch (err) {
      console.warn(`⚠️  Cohere embed failed: ${err.message?.substring(0, 80)} — trying HuggingFace...`);
    }
  }

  // 2. Fallback: HuggingFace
  if (process.env.HF_API_KEY) {
    try {
      const vec = await hfEmbed(text);
      console.log(`✅ Embedding via HuggingFace (${vec.length}-dim)`);
      return vec;
    } catch (err) {
      console.warn(`⚠️  HuggingFace embed failed: ${err.message?.substring(0, 80)} — trying Gemini...`);
    }
  }

  // 3. Final fallback: Gemini
  const vec = await geminiEmbed(text);
  console.log(`✅ Embedding via Gemini (${vec.length}-dim)`);
  return vec;
};

/**
 * Build embedding input text for a candidate
 */
const buildCandidateEmbeddingText = (skills, aiSummary) => {
  const skillText = Array.isArray(skills) ? skills.join(', ') : '';
  const summary = aiSummary || '';
  return `${skillText}. ${summary}`.trim();
};

/**
 * Build embedding input text for a job
 */
const buildJobEmbeddingText = (title, description, skillsRequired) => {
  const skills = Array.isArray(skillsRequired) ? skillsRequired.join(', ') : '';
  return `${title || ''}. ${description || ''}. Required skills: ${skills}`.trim();
};

module.exports = {
  generateEmbedding,
  buildCandidateEmbeddingText,
  buildJobEmbeddingText,
};
