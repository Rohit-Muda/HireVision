const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const Application = require('../models/Application');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// POST /api/scheduling/propose-slots
// Recruiter proposes 3 time slots for an application in 'interview' stage
router.post('/propose-slots', verifyFirebaseToken, async (req, res, next) => {
  try {
    const { applicationId, slots } = req.body;
    if (!applicationId || !slots || !Array.isArray(slots) || slots.length < 1) {
      return res.status(400).json({ error: 'applicationId and at least 1 slot are required' });
    }
    if (slots.length > 3) {
      return res.status(400).json({ error: 'Maximum 3 slots allowed' });
    }

    const application = await Application.findById(applicationId).populate('jobId');
    if (!application) return res.status(404).json({ error: 'Application not found' });

    // Validate recruiter owns this application's job
    if (application.jobId.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to schedule this interview' });
    }

    const formattedSlots = slots.map((slot) => ({
      time: new Date(slot.time),
      label: slot.label || new Date(slot.time).toLocaleString('en-IN', {
        dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata',
      }),
    }));

    application.interviewSlots = formattedSlots;
    application.stage = 'interview';
    application.updatedAt = new Date();
    await application.save();

    res.json({
      message: 'Interview slots proposed successfully',
      applicationId: application._id,
      slots: formattedSlots,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/scheduling/confirm-slot
// Candidate confirms one slot → generates Jitsi URL
router.post('/confirm-slot', verifyFirebaseToken, async (req, res, next) => {
  try {
    const { applicationId, slotIndex } = req.body;
    if (applicationId === undefined || slotIndex === undefined) {
      return res.status(400).json({ error: 'applicationId and slotIndex are required' });
    }

    const application = await Application.findById(applicationId);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    // Validate candidate owns this application
    if (application.candidateId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to confirm this slot' });
    }

    const idx = parseInt(slotIndex, 10);
    if (idx < 0 || idx >= application.interviewSlots.length) {
      return res.status(400).json({ error: 'Invalid slot index' });
    }

    const selectedSlot = application.interviewSlots[idx];

    // Generate a unique Jitsi Meet room URL (no API key required, works immediately)
    const roomId = `HireVision-${uuidv4().substring(0, 8).toUpperCase()}`;
    const jitsiUrl = `https://meet.jit.si/${roomId}`;

    application.scheduledSlot = selectedSlot.time;
    application.jitsiUrl = jitsiUrl;
    application.updatedAt = new Date();
    await application.save();

    res.json({
      message: 'Interview scheduled successfully',
      scheduledSlot: selectedSlot,
      jitsiUrl,
      roomId,
      instructions: 'Click the Jitsi link at your scheduled time. No account needed.',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/scheduling/:applicationId
// Get scheduling details for an application (recruiter or candidate)
router.get('/:applicationId', verifyFirebaseToken, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate('jobId', 'title company recruiterId')
      .populate('candidateId', 'name email')
      .lean();

    if (!application) return res.status(404).json({ error: 'Application not found' });

    // Only recruiter or the candidate can see this
    const isCandidate = application.candidateId._id.toString() === req.user._id.toString();
    const isRecruiter = application.jobId.recruiterId.toString() === req.user._id.toString();

    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({
      applicationId: application._id,
      stage: application.stage,
      interviewSlots: application.interviewSlots || [],
      scheduledSlot: application.scheduledSlot,
      jitsiUrl: application.jitsiUrl,
      candidate: { name: application.candidateId.name, email: application.candidateId.email },
      job: { title: application.jobId.title, company: application.jobId.company },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
