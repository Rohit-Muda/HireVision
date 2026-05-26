const express = require('express');
const router = express.Router();
const { analyzeVideoResume, getCandidateProfile, searchCandidates } = require('../controllers/candidateController');
const { verifyFirebaseToken } = require('../middleware/auth');
const { videoUpload } = require('../middleware/upload');
const rateLimit = require('express-rate-limit');

const videoAnalysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Video analysis limit reached. You can analyze 10 videos per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
  // ✅ Use firebaseUid as the key (auth is verified before this runs).
  // We skip req.ip entirely to avoid the express-rate-limit IPv6 validation error.
  keyGenerator: (req) => req.user?.firebaseUid ?? 'anon',
  skip: (req) => !req.user?.firebaseUid, // skip if auth failed (will 401 anyway)
});

router.get('/search', searchCandidates);
router.post(
  '/analyze-video',
  verifyFirebaseToken,
  videoAnalysisLimiter,
  videoUpload.single('video'),
  analyzeVideoResume
);
router.get('/:id/profile', getCandidateProfile);

module.exports = router;

