const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: 'Remote' },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time',
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead'],
      default: 'mid',
    },
    skillsRequired: { type: [String], default: [] },
    salaryRange: { type: String, default: null },
    jobEmbedding: { type: [Number], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

jobSchema.index({ recruiterId: 1 });
jobSchema.index({ isActive: 1 });
jobSchema.index({ skillsRequired: 1 });
jobSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);
