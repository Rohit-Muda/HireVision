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
  return `${skills.join(', ')}. ${aiSummary}`;
};

/**
 * Build embedding input text for a job
 */
const buildJobEmbeddingText = (title, description, skillsRequired) => {
  return `${title}. ${description}. Required skills: ${skillsRequired.join(', ')}`;
};

module.exports = { generateEmbedding, buildCandidateEmbeddingText, buildJobEmbeddingText };
