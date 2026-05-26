const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    firebaseUid: { type: String, required: true, unique: true },
    role: { type: String, enum: ['candidate', 'recruiter'], required: true },
    name: { type: String, required: true, trim: true },

    // Candidate fields
    videoUrl: { type: String, default: null },
    videoTranscript: { type: String, default: null },
    skills: { type: [String], default: [] },
    experienceSummary: { type: String, default: null },
    communicationScore: { type: Number, min: 0, max: 10, default: null },
    aiSummary: { type: String, default: null },
    profileEmbedding: { type: [Number], default: [] },
    videoAnalyzedAt: { type: Date, default: null },
    profilePhoto: { type: String, default: null },
    location: { type: String, default: null },
    education: { type: String, default: null },
    headline: { type: String, default: null },
    confidenceIndicators: { type: String, default: null },
    resumeUrl: { type: String, default: null },

    // Recruiter fields
    companyName: { type: String, default: null },
    companyLogo: { type: String, default: null },
    companyDescription: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ skills: 1 });

// Don't expose embedding in default toJSON
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.profileEmbedding;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
