const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
const { generateEmbedding, buildJobEmbeddingText } = require('../services/embeddingService');
const { matchCandidatesToJob } = require('../services/matchingService');

// POST /api/jobs
const createJob = async (req, res, next) => {
  try {
    const { title, description, company, location, jobType, experienceLevel, skillsRequired, salaryRange } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'title and description are required' });
    }

    // Generate embedding
    let jobEmbedding = [];
    try {
      const embeddingText = buildJobEmbeddingText(title, description, skillsRequired || []);
      jobEmbedding = await generateEmbedding(embeddingText);
    } catch (err) {
      console.warn('Job embedding failed:', err.message);
    }

    const job = await Job.create({
      recruiterId: req.user._id,
      title,
      description,
      company: company || req.user.companyName || 'Unknown Company',
      location: location || 'Remote',
      jobType: jobType || 'full-time',
      experienceLevel: experienceLevel || 'mid',
      skillsRequired: skillsRequired || [],
      salaryRange: salaryRange || '',
      jobEmbedding,
    });

    res.status(201).json({ message: 'Job created', job });
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs
const getJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, location, jobType } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') },
        { skillsRequired: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (location && location !== 'All') query.location = new RegExp(location, 'i');
    if (jobType && jobType !== 'All') query.jobType = jobType;

    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .select('-jobEmbedding')
        .populate('recruiterId', 'name companyName companyLogo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Job.countDocuments(query),
    ]);

    res.json({ jobs, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs/:id
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .select('-jobEmbedding')
      .populate('recruiterId', 'name companyName companyLogo companyDescription');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ job });
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs/:id/candidates  [CRITICAL - AI matching]
const getJobCandidates = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Fetch all candidates with embeddings
    const candidates = await User.find({
      role: 'candidate',
      profileEmbedding: { $exists: true, $not: { $size: 0 } },
    });

    if (candidates.length === 0) {
      return res.json({ candidates: [], message: 'No candidates with video resumes yet.' });
    }

    // Compute matches
    const matches = await matchCandidatesToJob(job, candidates);

    // Upsert Application records in parallel and capture applicationId per match
    const matchesWithAppId = await Promise.all(
      matches.map(async (match) => {
        try {
          const app = await Application.findOneAndUpdate(
            { candidateId: match.candidate._id, jobId: job._id },
            {
              $setOnInsert: {
                candidateId: match.candidate._id,
                jobId: job._id,
                stage: 'applied',
                appliedAt: new Date(),
              },
              $set: {
                matchScore: match.matchScore,
                matchExplanation: match.matchExplanation,
                matchedSkills: match.matchedSkills,
                missingSkills: match.missingSkills,
              },
            },
            { upsert: true, new: true }
          );
          // ✅ Return applicationId so frontend can shortlist without an extra GET
          return { ...match, applicationId: app._id.toString() };
        } catch (err) {
          if (err.code !== 11000) console.warn('Application upsert error:', err.message);
          return match;
        }
      })
    );

    res.json({ candidates: matchesWithAppId, total: matchesWithAppId.length });
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs/recruiter/mine
const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id })
      .select('-jobEmbedding')
      .sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (error) {
    next(error);
  }
};

module.exports = { createJob, getJobs, getJobById, getJobCandidates, getMyJobs };
