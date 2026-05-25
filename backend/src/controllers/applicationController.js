const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { matchCandidatesToJob } = require('../services/matchingService');

// POST /api/applications (candidate applies to a job)
const createApplication = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    const candidateId = req.user._id;

    if (!jobId) return res.status(400).json({ error: 'jobId is required' });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Check for existing application
    const existing = await Application.findOne({ candidateId, jobId });
    if (existing) {
      return res.status(409).json({ error: 'Already applied to this job', application: existing });
    }

    // Compute match score
    let matchScore = 0, matchExplanation = '', matchedSkills = [], missingSkills = [];
    if (req.user.profileEmbedding && req.user.profileEmbedding.length > 0) {
      const matches = await matchCandidatesToJob(job, [req.user]);
      if (matches.length > 0) {
        ({ matchScore, matchExplanation, matchedSkills, missingSkills } = matches[0]);
      }
    }

    const application = await Application.create({
      candidateId,
      jobId,
      matchScore,
      matchExplanation,
      matchedSkills,
      missingSkills,
      stage: 'applied',
      appliedAt: new Date(),
    });

    res.status(201).json({ message: 'Application submitted', application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Already applied to this job' });
    }
    next(error);
  }
};

// GET /api/applications/candidate/:candidateId
const getCandidateApplications = async (req, res, next) => {
  try {
    const { candidateId } = req.params;
    const applications = await Application.find({ candidateId })
      .populate('jobId', 'title company location jobType salaryRange skillsRequired')
      .sort({ appliedAt: -1 });
    res.json({ applications });
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/job/:jobId  (grouped by stage for Kanban)
const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ jobId })
      .populate('candidateId', '-profileEmbedding')
      .sort({ matchScore: -1 });

    // Group by stage
    const grouped = {
      applied: [],
      screened: [],
      interview: [],
      hired: [],
      rejected: [],
    };
    for (const app of applications) {
      if (grouped[app.stage]) grouped[app.stage].push(app);
    }

    res.json({ applications, grouped, total: applications.length });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/applications/:id/stage
const updateApplicationStage = async (req, res, next) => {
  try {
    const { stage } = req.body;
    const validStages = ['applied', 'screened', 'interview', 'hired', 'rejected'];

    if (!validStages.includes(stage)) {
      return res.status(400).json({ error: `Invalid stage. Must be one of: ${validStages.join(', ')}` });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { stage, updatedAt: new Date() },
      { new: true }
    ).populate('candidateId', '-profileEmbedding').populate('jobId', 'title company');

    if (!application) return res.status(404).json({ error: 'Application not found' });

    res.json({ message: 'Stage updated', application });
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/stats (recruiter stats)
const getRecruiterStats = async (req, res, next) => {
  try {
    const recruiterJobs = await Job.find({ recruiterId: req.user._id }).select('_id');
    const jobIds = recruiterJobs.map((j) => j._id.toString());

    const [totalApplications, pipeline, avgScore] = await Promise.all([
      Application.countDocuments({ jobId: { $in: jobIds } }),
      Application.countDocuments({ jobId: { $in: jobIds }, stage: { $nin: ['rejected', 'hired'] } }),
      Application.aggregate([
        { $match: { jobId: { $in: jobIds }, matchScore: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$matchScore' } } },
      ]),
    ]);

    res.json({
      totalJobs: recruiterJobs.length,
      totalApplications,
      inPipeline: pipeline,
      avgMatchScore: avgScore[0] ? Math.round(avgScore[0].avg * 10) / 10 : 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApplication,
  getCandidateApplications,
  getJobApplications,
  updateApplicationStage,
  getRecruiterStats,
};
