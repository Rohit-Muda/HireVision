const express = require('express');
const router = express.Router();
const { analyzeVideoResume, getCandidateProfile, searchCandidates } = require('../controllers/candidateController');
const { verifyFirebaseToken } = require('../middleware/auth');
const { videoUpload } = require('../middleware/upload');

router.get('/search', searchCandidates);
router.post('/analyze-video', verifyFirebaseToken, videoUpload.single('video'), analyzeVideoResume);
router.get('/:id/profile', getCandidateProfile);

module.exports = router;
