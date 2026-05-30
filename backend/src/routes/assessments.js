const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { generateSkillQuiz } = require('../services/aiService');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

const quizLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: { error: 'Assessment limit reached. You can take 15 assessments per hour.' },
  keyGenerator: (req) => req.user?.firebaseUid ?? 'anon',
});

// POST /api/assessments/generate
// Generate a 5-question quiz for a skill (questions returned to frontend)
router.post(
  '/generate',
  verifyFirebaseToken,
  quizLimiter,
  async (req, res, next) => {
    try {
      const { skill } = req.body;
      if (!skill || skill.trim().length < 1) {
        return res.status(400).json({ error: 'skill is required' });
      }

      console.log(`📝 Generating quiz for skill: ${skill}`);
      const quiz = await generateSkillQuiz(skill.trim());

      // Strip correct answers before sending to frontend (anti-cheat)
      const sanitizedQuestions = (quiz.questions || []).map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        type: q.type || 'multiple-choice',
        // correctAnswer and explanation stored server-side in session/cache
      }));

      // Store answers in a simple in-memory session (keyed by uid+skill)
      // In production, use Redis — for demo, this works fine
      if (!global._quizAnswerCache) global._quizAnswerCache = {};
      const cacheKey = `${req.user.firebaseUid}_${skill.toLowerCase().replace(/\s/g, '_')}`;
      global._quizAnswerCache[cacheKey] = {
        questions: quiz.questions,
        expiresAt: Date.now() + 30 * 60 * 1000, // 30 min
      };

      res.json({
        skill: quiz.skill || skill,
        questions: sanitizedQuestions,
        totalQuestions: sanitizedQuestions.length,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/assessments/submit
// Submit answers, grade them, save badge to user profile
router.post(
  '/submit',
  verifyFirebaseToken,
  async (req, res, next) => {
    try {
      const { skill, answers } = req.body;
      if (!skill || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: 'skill and answers[] are required' });
      }

      // Retrieve cached correct answers
      const cacheKey = `${req.user.firebaseUid}_${skill.toLowerCase().replace(/\s/g, '_')}`;
      const cached = global._quizAnswerCache?.[cacheKey];

      if (!cached || Date.now() > cached.expiresAt) {
        return res.status(400).json({ error: 'Quiz session expired. Please regenerate the quiz.' });
      }

      const { questions } = cached;
      let correct = 0;
      const results = questions.map((q, i) => {
        const userAnswer = (answers[i] || '').toUpperCase().trim().charAt(0); // extract A/B/C/D
        const isCorrect = userAnswer === q.correctAnswer?.toUpperCase();
        if (isCorrect) correct++;
        return {
          questionId: q.id,
          question: q.question,
          yourAnswer: answers[i] || '(not answered)',
          correctAnswer: q.correctAnswer,
          isCorrect,
          explanation: q.explanation,
        };
      });

      const score = correct;
      const total = questions.length;

      // Save or update badge on user profile
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const existingBadgeIdx = (user.skillBadges || []).findIndex(
        (b) => b.skill.toLowerCase() === skill.toLowerCase()
      );

      if (existingBadgeIdx >= 0) {
        // Only update if new score is better
        if (score >= user.skillBadges[existingBadgeIdx].score) {
          user.skillBadges[existingBadgeIdx] = { skill, score, total, earnedAt: new Date() };
        }
      } else {
        user.skillBadges.push({ skill, score, total, earnedAt: new Date() });
      }

      await user.save();

      // Clean cache entry
      delete global._quizAnswerCache[cacheKey];

      res.json({
        skill,
        score,
        total,
        percentage: Math.round((score / total) * 100),
        passed: score >= 3,
        results,
        badge: { skill, score, total },
        message: score >= 3 ? `🏆 Badge earned: ${skill} ${score}/${total}` : `Keep practicing! You got ${score}/${total}`,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/assessments/badges/:userId
// Get all skill badges for a candidate (public endpoint for recruiter view)
router.get('/badges/:userId', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select('skillBadges name role').lean();
    if (!user || user.role !== 'candidate') {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json({ badges: user.skillBadges || [], candidateName: user.name });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
