const express = require('express');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user');
const { generateToken, authenticateToken } = require('../utils/jwt');

const router = express.Router();

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Helper function to verify Google token
 */
const verifyGoogleToken = async (token) => {
  try {
    console.log('BACKEND: Verifying Google token with Google servers...');
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    console.log('BACKEND: Google token verified successfully by Google!');

    const payload = ticket.getPayload();
    return {
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    console.error('BACKEND: Google token verification FAILED:', error.message);
    throw new Error('Invalid Google token');
  }
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/google
 * @desc    Google OAuth Login/Register
 * @access  Public
 */
router.post('/google', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Google token is required' });
  }

  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ message: 'Google OAuth not configured' });
  }

  try {
    // Verify Google token
    const googleUser = await verifyGoogleToken(token);


    // Check if user already exists
    let user = await User.findOne({ email: googleUser.email });

    if (user) {
      // User exists - check if active
      if (!user.isActive) {
        return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
      }
      // Proceed to login
    } else {
      // User doesn't exist - register
      user = new User({
        name: googleUser.name,
        email: googleUser.email,
        password: 'google-oauth-user' // Placeholder password for Google users
      });

      await user.save();
    }

    // Generate JWT token
    const jwtToken = generateToken(user);

    res.json({
      message: user.isNew ? 'Registration successful' : 'Login successful',
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      }
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

/**
 * @route   GET /api/auth/verify-token
 * @desc    Verify if token is still valid
 * @access  Private
 */
router.get('/verify-token', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

module.exports = router;
