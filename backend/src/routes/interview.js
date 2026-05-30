const express = require('express');
const router = express.Router();
const { verifyFirebaseToken, requireRole } = require('../middleware/auth');
const { generateInterviewQuestions, evaluateInterviewAnswers } = require('../services/aiService');
const Job = require('../models/Job');
const rateLimit = require('express-rate-limit');

const interviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Interview practice limit reached. Try again in an hour.' },
  keyGenerator: (req) => req.user?.firebaseUid ?? 'anon',
});

// POST /api/interview/generate-questions
// Candidate: generate 5 interview questions for a job
router.post(
  '/generate-questions',
  verifyFirebaseToken,
  interviewLimiter,
  async (req, res, next) => {
    try {
      const { jobId } = req.body;
      if (!jobId) return res.status(400).json({ error: 'jobId is required' });

      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ error: 'Job not found' });

      console.log(`🎤 Generating interview questions for: ${job.title}`);
      const result = await generateInterviewQuestions(
        job.title,
        job.description,
        job.skillsRequired || []
      );

      res.json({
        jobId: job._id,
        jobTitle: job.title,
        questions: result.questions || [],
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/interview/evaluate-answers
// Candidate: evaluate their answers to interview questions
router.post(
  '/evaluate-answers',
  verifyFirebaseToken,
  async (req, res, next) => {
    try {
      const { jobId, questions, answers } = req.body;
      if (!jobId || !questions || !answers) {
        return res.status(400).json({ error: 'jobId, questions, and answers are required' });
      }
      if (!Array.isArray(answers) || answers.length !== questions.length) {
        return res.status(400).json({ error: 'answers must match questions count' });
      }

      const job = await Job.findById(jobId).lean();
      if (!job) return res.status(404).json({ error: 'Job not found' });

      console.log(`📊 Evaluating ${answers.length} answers for: ${job.title}`);
      const result = await evaluateInterviewAnswers(questions, answers, job.title);

      res.json({
        jobId: job._id,
        jobTitle: job.title,
        evaluation: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
