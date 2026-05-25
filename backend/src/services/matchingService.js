const { generateMatchExplanation } = require('./aiService');

/**
 * Compute cosine similarity between two equal-length vectors
 * Returns value in range [0, 1]
 */
const cosineSimilarity = (a, b) => {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const mag = Math.sqrt(magA) * Math.sqrt(magB);
  if (mag === 0) return 0;
  // Normalize cosine similarity from [-1,1] to [0,100]
  const raw = dot / mag;
  return Math.round(((raw + 1) / 2) * 10000) / 100; // 0-100 scale
};

/**
 * Match candidates to a job using cosine similarity on embeddings
 * @param {Object} job - job document with jobEmbedding and skillsRequired
 * @param {Array} candidates - candidate user documents with profileEmbedding and skills
 * @returns {Promise<Array>} sorted match results
 */
const matchCandidatesToJob = async (job, candidates) => {
  const results = [];

  for (const candidate of candidates) {
    if (!candidate.profileEmbedding || candidate.profileEmbedding.length === 0) continue;

    const rawScore = cosineSimilarity(job.jobEmbedding, candidate.profileEmbedding);
    const matchScore = Math.min(100, Math.max(0, rawScore));

    // Skill overlap analysis
    const candidateSkillsLower = (candidate.skills || []).map((s) => s.toLowerCase());
    const jobSkillsLower = (job.skillsRequired || []).map((s) => s.toLowerCase());

    const matchedSkills = job.skillsRequired.filter((s) =>
      candidateSkillsLower.includes(s.toLowerCase())
    );
    const missingSkills = job.skillsRequired.filter(
      (s) => !candidateSkillsLower.includes(s.toLowerCase())
    );

    // Build base explanation
    let matchExplanation =
      matchedSkills.length > 0
        ? `Strong match — experienced in ${matchedSkills.join(', ')}.${
            missingSkills.length
              ? ' Missing: ' + missingSkills.join(', ') + '.'
              : ' Covers all required skills.'
          }`
        : `Limited skill overlap.${
            missingSkills.length ? ' Missing: ' + missingSkills.join(', ') + '.' : ''
          }`;

    // Use Gemini for richer explanation on high-score matches
    if (matchScore > 70) {
      try {
        const richExplanation = await generateMatchExplanation(
          candidate.skills || [],
          job.skillsRequired || [],
          Math.round(matchScore)
        );
        if (richExplanation) matchExplanation = richExplanation;
      } catch (err) {
        console.warn('Gemini match explanation failed, using rule-based:', err.message);
      }
    }

    results.push({
      candidate: candidate.toPublicJSON ? candidate.toPublicJSON() : candidate,
      matchScore: Math.round(matchScore * 10) / 10,
      matchExplanation,
      matchedSkills,
      missingSkills,
    });
  }

  // Sort by match score descending
  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
};

module.exports = { cosineSimilarity, matchCandidatesToJob };
