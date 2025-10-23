const connectToDatabase = require('../utils/mongodb');
const User = require('../models/user');
const jwt = require('../utils/jwt');

module.exports = async (req, res) => {
  await connectToDatabase();

  // POST /api/auth/login - user login
  if (req.method === 'POST' && req.url.endsWith('/login')) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
      }
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.signToken(user);
      res.status(200).json({ message: 'Login successful', token, user });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // POST /api/auth/register - user registration
  if (req.method === 'POST' && req.url.endsWith('/register')) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password required' });
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
      }
      const user = new User({ name, email, password });
      await user.save();
      const token = jwt.signToken(user);
      res.status(201).json({ message: 'Registration successful', token, user });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // GET /api/auth/verify-token - verify JWT token
  if (req.method === 'GET' && req.url.endsWith('/verify-token')) {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
      }
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ user });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
};
