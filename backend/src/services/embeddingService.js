const { getGenAI } = require('../config/gemini');

/**
 * Generate a 768-dim embedding vector from text using text-embedding-004
 * @param {string} text
 * @returns {Promise<number[]>} 768-dim float array
 */
const generateEmbedding = async (text) => {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(text);
  return result.embedding.values;
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

module.exports = { generateEmbedding, buildCandidateEmbeddingText, buildJobEmbeddingText };
