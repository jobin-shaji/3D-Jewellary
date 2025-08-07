const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
require('dotenv').config();

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081'], // Frontend URLs (change in production)
  credentials: false // No need for cookies with JWT
}));

app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// JWT Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate JWT token
const generateToken = (user) => {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    totalOrders: user.totalOrders,
    totalSpent: user.totalSpent,
    loyaltyPoints: user.loyaltyPoints
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-demo';

if (!MONGODB_URI || !PORT) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Register endpoint (no bcrypt)
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Save new user (password should be hashed in real implementation)
    const newUser = new User({
      name,
      email,
      password
      // id, isVerified, role, createdAt, etc. are automatically set by the schema defaults
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
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt,
        totalOrders: newUser.totalOrders,
        totalSpent: newUser.totalSpent,
        loyaltyPoints: newUser.loyaltyPoints
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint (no bcrypt)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) { 
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    else if (user.password !== password) {
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
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent,
        loyaltyPoints: user.loyaltyPoints
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// Logout endpoint (with JWT, logout is handled client-side by removing token)

// Get current user endpoint (protected route)
app.get('/api/user', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isVerified: req.user.isVerified,
      createdAt: req.user.createdAt,
      totalOrders: req.user.totalOrders,
      totalSpent: req.user.totalSpent,
      loyaltyPoints: req.user.loyaltyPoints
    }
  });
});

// Check auth status endpoint (protected route)
app.get('/api/auth-status', authenticateToken, (req, res) => {
  res.json({
    isLoggedIn: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isVerified: req.user.isVerified,
      createdAt: req.user.createdAt,
      totalOrders: req.user.totalOrders,
      totalSpent: req.user.totalSpent,
      loyaltyPoints: req.user.loyaltyPoints
    }
  });
});

// Verify token endpoint (for checking if token is still valid)
app.get('/api/verify-token', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

// Export the authenticateToken middleware for use in other routes
module.exports = { authenticateToken };

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

