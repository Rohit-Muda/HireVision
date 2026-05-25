const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJobById, getJobCandidates, getMyJobs } = require('../controllers/jobController');
const { verifyFirebaseToken, requireRole } = require('../middleware/auth');

router.get('/', getJobs);
router.get('/recruiter/mine', verifyFirebaseToken, requireRole('recruiter'), getMyJobs);
router.post('/', verifyFirebaseToken, requireRole('recruiter'), createJob);
router.get('/:id', getJobById);
router.get('/:id/candidates', verifyFirebaseToken, requireRole('recruiter'), getJobCandidates);

module.exports = router;
