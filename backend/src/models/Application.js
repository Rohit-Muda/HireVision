const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    matchScore: { type: Number, min: 0, max: 100, default: 0 },
    matchExplanation: { type: String, default: '' },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    stage: {
      type: String,
      enum: ['applied', 'screened', 'interview', 'hired', 'rejected'],
      default: 'applied',
    },
    notes: { type: String, default: '' },
    appliedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    // Interview scheduling (Phase 5)
    interviewSlots: {
      type: [{ time: Date, label: String }],
      default: [],
    },
    scheduledSlot: { type: Date, default: null },
    jitsiUrl: { type: String, default: null },
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ jobId: 1, stage: 1 });
applicationSchema.index({ candidateId: 1 });

module.exports = mongoose.model('Application', applicationSchema);
