const express = require('express');
const router = express.Router();
const { admin } = require('../config/firebase');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { generateEmbedding, buildCandidateEmbeddingText, buildJobEmbeddingText } = require('../services/embeddingService');

const SEED_RECRUITERS = [
  { name: 'Priya Sharma', email: 'priya@techcorp.in', role: 'recruiter', companyName: 'TechCorp India', companyDescription: 'Leading fintech startup building next-gen payment solutions.' },
  { name: 'Rahul Mehta', email: 'rahul@designhub.io', role: 'recruiter', companyName: 'DesignHub', companyDescription: 'Creative design agency crafting world-class digital experiences.' },
  { name: 'Ananya Singh', email: 'ananya@dataflow.ai', role: 'recruiter', companyName: 'DataFlow AI', companyDescription: 'AI/ML solutions company building enterprise-grade intelligence.' },
];

const SEED_JOBS = [
  { title: 'Senior React Developer', company: 'TechCorp India', recruiterEmail: 'priya@techcorp.in', description: "We're looking for a React expert to lead our frontend team. You'll architect component systems, mentor junior developers, and ship features used by 500K+ users. Strong TypeScript and testing skills required.", location: 'Bangalore', jobType: 'full-time', experienceLevel: 'senior', skillsRequired: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Testing'], salaryRange: '₹18-28 LPA' },
  { title: 'Full-Stack Developer', company: 'TechCorp India', recruiterEmail: 'priya@techcorp.in', description: 'Build end-to-end features for our payments platform. Work with React on frontend and Node.js on backend. Knowledge of databases and cloud services is a plus.', location: 'Remote', jobType: 'full-time', experienceLevel: 'mid', skillsRequired: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'REST APIs'], salaryRange: '₹12-20 LPA' },
  { title: 'UI/UX Designer & Developer', company: 'DesignHub', recruiterEmail: 'rahul@designhub.io', description: "Join our creative team to design and build beautiful web experiences. You'll work with Figma for design and implement with React + Tailwind CSS. Strong visual sense required.", location: 'Mumbai', jobType: 'full-time', experienceLevel: 'mid', skillsRequired: ['Figma', 'UI/UX', 'React', 'Tailwind CSS', 'HTML'], salaryRange: '₹10-18 LPA' },
  { title: 'Junior Frontend Developer', company: 'DataFlow AI', recruiterEmail: 'ananya@dataflow.ai', description: 'Great opportunity for fresh graduates passionate about frontend development. You\'ll work on our AI dashboard, learning React and modern web technologies. Mentorship provided.', location: 'Hyderabad', jobType: 'full-time', experienceLevel: 'entry', skillsRequired: ['HTML', 'CSS', 'JavaScript', 'React'], salaryRange: '₹5-8 LPA' },
  { title: 'Backend Developer (Node.js)', company: 'TechCorp India', recruiterEmail: 'priya@techcorp.in', description: 'Build scalable APIs and microservices for our fintech platform. Experience with Node.js, databases, and cloud deployment required. AWS/GCP experience preferred.', location: 'Bangalore', jobType: 'full-time', experienceLevel: 'mid', skillsRequired: ['Node.js', 'MongoDB', 'PostgreSQL', 'Docker', 'REST APIs'], salaryRange: '₹14-22 LPA' },
  { title: 'AI/ML Engineering Intern', company: 'DataFlow AI', recruiterEmail: 'ananya@dataflow.ai', description: '6-month internship working on our NLP pipeline. You\'ll help build and evaluate language models for enterprise applications. Python and basic ML knowledge required.', location: 'Remote', jobType: 'internship', experienceLevel: 'entry', skillsRequired: ['Python', 'Machine Learning', 'NLP', 'Data Analysis'], salaryRange: '₹25K/month' },
];

const SEED_CANDIDATES = [
  {
    name: 'Arjun Patel',
    email: 'arjun@test.com',
    headline: 'Full-Stack Developer | React & Node.js',
    skills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'CSS', 'Git'],
    experienceSummary: '3 years of full-stack development experience. Built multiple production web applications using React and Node.js.',
    communicationScore: 8,
    aiSummary: 'Experienced full-stack developer with 3 years of production experience in React and Node.js. Demonstrates strong problem-solving ability and clear, confident communication.',
    location: 'Bangalore',
    education: 'B.Tech Computer Science, VIT',
    confidenceIndicators: 'High confidence, clear articulation, well-structured delivery',
    skillBadges: [
      { skill: 'React', score: 4, total: 5, earnedAt: new Date(Date.now() - 172800000) },
      { skill: 'JavaScript', score: 5, total: 5, earnedAt: new Date(Date.now() - 86400000) }
    ],
    careerRecommendations: {
      topJobCategories: ['Senior React Developer', 'Full-Stack Developer', 'Frontend Engineer'],
      skillsToLearn: ['TypeScript', 'Next.js', 'System Design'],
      careerAdvice: 'Master state management with Redux/Zustand and learn TypeScript to move to senior full-stack roles.',
      salaryPotential: '₹14-22 LPA',
      generatedAt: new Date()
    }
  },
  {
    name: 'Sneha Kumar',
    email: 'sneha@test.com',
    headline: 'Frontend Developer | React | UI/UX Enthusiast',
    skills: ['React', 'TypeScript', 'Figma', 'Tailwind CSS', 'HTML', 'JavaScript'],
    experienceSummary: '2 years focused on frontend development with React. Strong design skills with Figma. Passionate about user experience.',
    communicationScore: 9,
    aiSummary: 'Creative frontend developer combining strong React skills with UI/UX design expertise. Excellent communicator with a keen eye for detail and user-centric design thinking.',
    location: 'Mumbai',
    education: 'BCA, Mumbai University',
    confidenceIndicators: 'Exceptional confidence, engaging delivery, minimal filler words',
    skillBadges: [
      { skill: 'React', score: 5, total: 5, earnedAt: new Date(Date.now() - 172800000) },
      { skill: 'Figma', score: 5, total: 5, earnedAt: new Date(Date.now() - 86400000) }
    ],
    careerRecommendations: {
      topJobCategories: ['Frontend Developer', 'UI/UX Designer & Developer', 'Product Designer'],
      skillsToLearn: ['Tailwind CSS', 'Framer Motion', 'Web Accessibility'],
      careerAdvice: 'Focus on advanced animation frameworks like Framer Motion to leverage your design eye in frontend products.',
      salaryPotential: '₹12-18 LPA',
      generatedAt: new Date()
    }
  },
  {
    name: 'Vikram Reddy',
    email: 'vikram@test.com',
    headline: 'Backend Developer | Node.js | Cloud',
    skills: ['Node.js', 'Python', 'MongoDB', 'Docker', 'AWS', 'REST APIs'],
    experienceSummary: '4 years of backend development. Expert in building scalable APIs and microservices. Strong cloud deployment experience.',
    communicationScore: 7,
    aiSummary: 'Senior backend developer with 4 years of experience building scalable systems. Strong technical skills in Node.js and cloud infrastructure with solid communication abilities.',
    location: 'Hyderabad',
    education: 'M.Tech, IIT Hyderabad',
    confidenceIndicators: 'Good confidence, technical clarity, slightly fast pacing',
    skillBadges: [
      { skill: 'Node.js', score: 4, total: 5, earnedAt: new Date(Date.now() - 172800000) }
    ],
    careerRecommendations: {
      topJobCategories: ['Backend Developer (Node.js)', 'Cloud Architect', 'DevOps Engineer'],
      skillsToLearn: ['Docker', 'Kubernetes', 'Redis', 'GraphQL'],
      careerAdvice: 'Develop experience with container orchestrations (Kubernetes) and caching layers (Redis) to unlock high-scale roles.',
      salaryPotential: '₹16-25 LPA',
      generatedAt: new Date()
    }
  },
  {
    name: 'Rohan Sharma',
    email: 'rohan@test.com',
    headline: 'Frontend Engineer | React & Tailwind',
    skills: ['React', 'Tailwind CSS', 'JavaScript', 'HTML', 'CSS', 'Redux'],
    experienceSummary: '1.5 years of experience developing responsive web applications.',
    communicationScore: 8,
    aiSummary: 'Detail-oriented frontend engineer with 1.5 years of experience specializing in React and Tailwind CSS. Demonstrates high visual excellence and clear coding logic.',
    location: 'Bangalore',
    education: 'B.Sc Computer Science, Delhi University',
    confidenceIndicators: 'High energy, precise delivery, minimal filler words',
    skillBadges: [
      { skill: 'React', score: 5, total: 5, earnedAt: new Date() },
      { skill: 'JavaScript', score: 4, total: 5, earnedAt: new Date() }
    ],
    careerRecommendations: {
      topJobCategories: ['Senior React Developer', 'UI Engineer', 'Frontend Team Lead'],
      skillsToLearn: ['TypeScript', 'Next.js'],
      careerAdvice: 'Focus on mastering Next.js and TypeScript to transition to a senior engineer role.',
      salaryPotential: '₹10-16 LPA',
      generatedAt: new Date()
    }
  }
];

// POST /api/seed
router.post('/', async (req, res) => {
  try {
    console.log('🌱 Starting seed...');

    // Clear existing seed data
    await User.deleteMany({ email: { $in: [...SEED_RECRUITERS.map(r => r.email), ...SEED_CANDIDATES.map(c => c.email)] } });
    await Job.deleteMany({ company: { $in: ['TechCorp India', 'DesignHub', 'DataFlow AI'] } });
    await Application.deleteMany({});

    // Create Firebase users and MongoDB recruiter records
    const recruiterMap = {};
    for (const rec of SEED_RECRUITERS) {
      let firebaseUid;
      try {
        const fbUser = await admin.auth().createUser({ email: rec.email, password: 'HireVision@123', displayName: rec.name });
        firebaseUid = fbUser.uid;
      } catch (err) {
        if (err.code === 'auth/email-already-exists') {
          const existing = await admin.auth().getUserByEmail(rec.email);
          firebaseUid = existing.uid;
        } else throw err;
      }

      await User.deleteOne({ email: rec.email });
      const recruiter = await User.create({ ...rec, firebaseUid });
      recruiterMap[rec.email] = recruiter;
      console.log(`✅ Recruiter created: ${rec.name}`);
    }

    // Create jobs with embeddings
    for (const jobData of SEED_JOBS) {
      const { recruiterEmail, ...rest } = jobData;
      const recruiter = recruiterMap[recruiterEmail];
      let jobEmbedding = [];
      try {
        const embText = buildJobEmbeddingText(rest.title, rest.description, rest.skillsRequired);
        jobEmbedding = await generateEmbedding(embText);
      } catch (err) {
        console.warn(`Embedding failed for ${rest.title}:`, err.message);
      }
      await Job.create({ ...rest, recruiterId: recruiter._id, jobEmbedding });
      console.log(`✅ Job created: ${rest.title}`);
    }

    // Create candidate users with embeddings
    for (const cand of SEED_CANDIDATES) {
      let firebaseUid;
      try {
        const fbUser = await admin.auth().createUser({ email: cand.email, password: 'HireVision@123', displayName: cand.name });
        firebaseUid = fbUser.uid;
      } catch (err) {
        if (err.code === 'auth/email-already-exists') {
          const existing = await admin.auth().getUserByEmail(cand.email);
          firebaseUid = existing.uid;
        } else throw err;
      }

      let profileEmbedding = [];
      try {
        const embText = buildCandidateEmbeddingText(cand.skills, cand.aiSummary);
        profileEmbedding = await generateEmbedding(embText);
      } catch (err) {
        console.warn(`Embedding failed for ${cand.name}:`, err.message);
      }

      await User.deleteOne({ email: cand.email });
      await User.create({
        ...cand,
        role: 'candidate',
        firebaseUid,
        profileEmbedding,
        videoAnalyzedAt: new Date(),
        videoUrl: null,
        videoTranscript: cand.aiSummary,
      });
      console.log(`✅ Candidate created: ${cand.name}`);
    }

    // Seed applications
    console.log('🌱 Seeding applications...');
    const allJobs = await Job.find({});
    const allCandidates = await User.find({ role: 'candidate' });

    // Map jobs by title
    const reactJob = allJobs.find(j => j.title === 'Senior React Developer');
    const backendJob = allJobs.find(j => j.title === 'Backend Developer (Node.js)');

    const arjun = allCandidates.find(c => c.email === 'arjun@test.com');
    const sneha = allCandidates.find(c => c.email === 'sneha@test.com');
    const vikram = allCandidates.find(c => c.email === 'vikram@test.com');
    const rohan = allCandidates.find(c => c.email === 'rohan@test.com');

    if (reactJob && arjun) {
      await Application.create({
        candidateId: arjun._id,
        jobId: reactJob._id,
        matchScore: 78,
        matchExplanation: 'Arjun has strong full-stack skills with React and Node.js. Lacks specific testing frameworks in his current profile.',
        matchedSkills: ['React', 'JavaScript', 'CSS'],
        missingSkills: ['TypeScript', 'Testing'],
        stage: 'screened',
        notes: 'Good candidate, communication is confident.',
      });
    }

    if (reactJob && sneha) {
      await Application.create({
        candidateId: sneha._id,
        jobId: reactJob._id,
        matchScore: 88,
        matchExplanation: 'Sneha shows brilliant frontend skills with React and Tailwind CSS. Figma UI/UX background matches senior user-experience requirements.',
        matchedSkills: ['React', 'TypeScript', 'HTML', 'JavaScript'],
        missingSkills: ['Testing'],
        stage: 'interview',
        notes: 'Highly confident, scheduled interview slots.',
        interviewSlots: [
          { time: new Date(Date.now() + 86400000 * 2), label: '2 days from now (Morning)' },
          { time: new Date(Date.now() + 86400000 * 3), label: '3 days from now (Afternoon)' },
        ],
      });
    }

    if (reactJob && rohan) {
      await Application.create({
        candidateId: rohan._id,
        jobId: reactJob._id,
        matchScore: 82,
        matchExplanation: 'Rohan is a solid frontend specialist with strong React and CSS foundations.',
        matchedSkills: ['React', 'JavaScript', 'CSS'],
        missingSkills: ['TypeScript', 'Testing'],
        stage: 'applied',
        notes: 'Need to test testing skills.',
      });
    }

    if (backendJob && vikram) {
      await Application.create({
        candidateId: vikram._id,
        jobId: backendJob._id,
        matchScore: 94,
        matchExplanation: 'Vikram has excellent Node.js experience and backend expertise. Proficient in MongoDB and building scale APIs.',
        matchedSkills: ['Node.js', 'MongoDB', 'REST APIs'],
        missingSkills: ['Docker'],
        stage: 'applied',
        notes: 'Top fit for backend engineering.',
      });
    }

    console.log('🎉 Seed complete!');
    res.json({
      message: 'Database seeded successfully',
      recruiters: SEED_RECRUITERS.length,
      jobs: SEED_JOBS.length,
      candidates: SEED_CANDIDATES.length,
      applications: 4
    });
  } catch (error) {
    console.error('❌ Seed error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
