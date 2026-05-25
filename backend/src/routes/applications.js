const express = require('express');
const router = express.Router();
const {
  createApplication,
  getCandidateApplications,
  getJobApplications,
  updateApplicationStage,
  getRecruiterStats,
} = require('../controllers/applicationController');
const { verifyFirebaseToken, requireRole } = require('../middleware/auth');

router.post('/', verifyFirebaseToken, requireRole('candidate'), createApplication);
router.get('/candidate/:candidateId', verifyFirebaseToken, getCandidateApplications);
router.get('/job/:jobId', verifyFirebaseToken, requireRole('recruiter'), getJobApplications);
router.patch('/:id/stage', verifyFirebaseToken, requireRole('recruiter'), updateApplicationStage);
router.get('/recruiter/stats', verifyFirebaseToken, requireRole('recruiter'), getRecruiterStats);

module.exports = router;
