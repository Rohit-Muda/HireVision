const User = require('../models/User');
const { uploadToStorage } = require('../services/storageService');
const { analyzeTranscript, analyzeVideo } = require('../services/aiService');
const { generateEmbedding, buildCandidateEmbeddingText } = require('../services/embeddingService');

// POST /api/candidates/analyze-video
const analyzeVideoResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const uid = req.user.firebaseUid;
    const timestamp = Date.now();
    // Normalize MIME: strip codec params (e.g. 'video/webm;codecs=vp9,opus' → 'video/webm')
    const rawMime = req.file.mimetype || 'video/webm';
    const mimeType = rawMime.split(';')[0].trim() || 'video/webm';

    // Determine file extension from MIME type
    const extMap = {
      'video/webm': 'webm',
      'video/mp4': 'mp4',
      'video/quicktime': 'mov',
      'video/x-msvideo': 'avi',
      'video/ogg': 'ogv',
      'video/3gpp': '3gp',
      'application/octet-stream': 'webm', // browser fallback
    };
    const ext = extMap[mimeType] || 'webm';
    const destination = `videos/${uid}/${timestamp}.${ext}`;

    // ─── Step 1: AI Analysis ─────────────────────────────────────────────────
    // STRATEGY: Use transcript from browser Speech API (text-only, ~200 tokens)
    // instead of sending raw video (50,000+ tokens). 100x cheaper.
    // Falls back to video analysis only if no transcript provided.
    let analysis;
    const browserTranscript = req.body?.transcript?.trim();

    try {
      if (browserTranscript && browserTranscript.length >= 10) {
        // ✅ PRIMARY: Text-only analysis — cheap and fast
        console.log(`📝 Using browser transcript (${browserTranscript.length} chars) — text-only AI analysis`);
        analysis = await analyzeTranscript(browserTranscript);
      } else {
        // ⚠️ FALLBACK: Full video analysis — expensive, uses lots of tokens
        console.log(`🎬 No browser transcript — falling back to full video analysis (${(req.file.buffer.length / 1024 / 1024).toFixed(2)} MB)...`);
        analysis = await analyzeVideo(req.file.buffer, mimeType);
      }
      console.log(`✅ AI analysis complete (mode: ${analysis.analysisMode}, model: ${analysis.modelUsed})`);
    } catch (err) {
      console.error('AI analysis failed:', err.message);
      const isQuota = err.message.includes('quota') || err.message.includes('exhausted');
      const status = isQuota ? 429 : 500;
      const userMsg = isQuota
        ? 'AI quota temporarily exceeded. Please try again in a few minutes.'
        : `AI analysis failed: ${err.message}`;
      return res.status(status).json({ error: userMsg, retryable: isQuota });
    }

    // ─── Step 2: Upload video to Firebase Storage (for recruiter playback) ──
    let publicUrl = null;
    try {
      publicUrl = await uploadToStorage(req.file.buffer, destination, mimeType);
      console.log('✅ Video uploaded to Firebase Storage:', publicUrl);
    } catch (err) {
      // Non-fatal — analysis succeeded, just log the storage failure
      console.error('Firebase Storage upload failed (non-fatal):', err.message);
    }

    // Handle short/empty video (no speech detected)
    if (analysis.error || !analysis.transcript) {
      const updateData = {
        videoUrl: publicUrl,
        videoTranscript: '',
        skills: [],
        experienceSummary: '',
        communicationScore: 0,
        aiSummary: 'No speech was detected in the video.',
        videoAnalyzedAt: new Date(),
      };
      await User.findByIdAndUpdate(req.user._id, updateData);
      return res.status(200).json({
        warning: analysis.error || 'No speech detected in video. Please re-record and speak clearly.',
        ...updateData,
        videoUrl: publicUrl,
      });
    }

    // ─── Step 3: Generate embedding for job matching ─────────────────────────
    let profileEmbedding = [];
    try {
      const embeddingText = buildCandidateEmbeddingText(analysis.skills, analysis.aiSummary);
      profileEmbedding = await generateEmbedding(embeddingText);
      console.log('✅ Embedding generated:', profileEmbedding.length, 'dimensions');
    } catch (err) {
      console.warn('Embedding generation failed (non-fatal):', err.message);
    }

    // ─── Step 4: Persist to MongoDB ──────────────────────────────────────────
    const updateData = {
      videoUrl: publicUrl,
      videoTranscript: analysis.transcript,
      skills: analysis.skills,
      experienceSummary: analysis.experienceSummary,
      communicationScore: analysis.communicationScore,
      aiSummary: analysis.aiSummary,
      confidenceIndicators: analysis.confidenceIndicators,
      profileEmbedding,
      videoAnalyzedAt: new Date(),
    };

    // Save career recommendations if generated
    if (analysis.careerRecommendations) {
      updateData.careerRecommendations = {
        ...analysis.careerRecommendations,
        generatedAt: new Date(),
      };
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });

    res.json({
      message: 'Video analyzed successfully',
      analysis,
      videoUrl: publicUrl,
      user: updatedUser.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/candidates/:id/profile
const getCandidateProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'candidate' });
    if (!user) return res.status(404).json({ error: 'Candidate not found' });
    res.json({ candidate: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
};

// GET /api/candidates/search
const searchCandidates = async (req, res, next) => {
  try {
    const { skills, location } = req.query;
    const query = { role: 'candidate' };

    if (skills) {
      const skillList = skills.split(',').map((s) => s.trim());
      query.skills = { $in: skillList.map((s) => new RegExp(s, 'i')) };
    }
    if (location) {
      query.location = new RegExp(location, 'i');
    }

    const candidates = await User.find(query).select('-profileEmbedding -__v').limit(50);
    res.json({ candidates });
  } catch (error) {
    next(error);
  }
};

// POST /api/candidates/upload-resume
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const uid = req.user.firebaseUid;
    const timestamp = Date.now();
    const destination = `resumes/${uid}/${timestamp}.pdf`;

    let publicUrl = null;
    try {
      publicUrl = await uploadToStorage(req.file.buffer, destination, 'application/pdf');
      console.log('✅ Resume PDF uploaded:', publicUrl);
    } catch (err) {
      console.error('Firebase Storage upload failed:', err.message);
      return res.status(500).json({ error: 'Failed to upload resume. Please try again.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { resumeUrl: publicUrl },
      { new: true }
    );

    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl: publicUrl,
      user: updatedUser.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeVideoResume, getCandidateProfile, searchCandidates, uploadResume };
