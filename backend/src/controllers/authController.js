const { admin } = require('../config/firebase');
const User = require('../models/User');
const axios = require('axios');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'email, password, name, and role are required' });
    }
    if (!['candidate', 'recruiter'].includes(role)) {
      return res.status(400).json({ error: 'role must be candidate or recruiter' });
    }

    // Create Firebase Auth user
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({ email, password, displayName: name });
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        return res.status(409).json({ error: 'Email already registered' });
      }
      throw err;
    }

    // Create MongoDB user
    const user = await User.create({
      email: email.toLowerCase(),
      firebaseUid: firebaseUser.uid,
      role,
      name,
    });

    // Create a custom token for immediate login
    const customToken = await admin.auth().createCustomToken(firebaseUser.uid);

    res.status(201).json({
      message: 'Registration successful',
      user: user.toPublicJSON(),
      customToken,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    // Sign in via Firebase REST API
    const apiKey = process.env.FIREBASE_API_KEY;
    const firebaseUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    let firebaseResponse;
    try {
      const resp = await axios.post(firebaseUrl, {
        email,
        password,
        returnSecureToken: true,
      });
      firebaseResponse = resp.data;
    } catch (err) {
      const errCode = err.response?.data?.error?.message;
      if (errCode === 'INVALID_PASSWORD' || errCode === 'EMAIL_NOT_FOUND' || errCode?.includes('INVALID_LOGIN_CREDENTIALS')) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      throw err;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Login successful',
      idToken: firebaseResponse.idToken,
      refreshToken: firebaseResponse.refreshToken,
      expiresIn: firebaseResponse.expiresIn,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
};

module.exports = { register, login, getMe };
