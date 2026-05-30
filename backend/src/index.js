require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { initializeFirebase } = require('./config/firebase');
const errorHandler = require('./middleware/errorHandler');

// Initialize services
initializeFirebase();
connectDB();

const app = express();
const PORT = process.env.PORT || 8080;

// ─── Security & CORS ─────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (origin, callback) => {
    // Dynamic origin mirroring to support credentials: true with any origin
    callback(null, true);
  },
  credentials: true,
}));

// ─── Logging & Parsing ───────────────────────────────────────────────────────
app.use(morgan('dev'));
app.use(express.json({ limit: '250mb' }));
app.use(express.urlencoded({ extended: true, limit: '250mb' }));

// ─── Rate Limiters ───────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many login attempts. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const videoAnalysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Video analysis limit reached. You can analyze 10 videos per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health', // never throttle health checks
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use(apiLimiter);
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/candidates', require('./routes/candidates'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/seed', require('./routes/seed'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/scheduling', require('./routes/scheduling'));

// Recruiter profile update
app.put('/api/recruiters/profile', require('./middleware/auth').verifyFirebaseToken, async (req, res, next) => {
  try {
    const User = require('./models/User');
    const { companyName, companyLogo, companyDescription } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { companyName, companyLogo, companyDescription },
      { new: true }
    );
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    dbConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 HireVision API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;
