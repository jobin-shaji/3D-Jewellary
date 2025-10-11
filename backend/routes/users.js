const express = require('express');
const User = require('../models/user');
const { authenticateToken } = require('../utils/jwt');
const bcrypt = require('bcrypt');

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id }).select('-password');
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      message: 'Profile retrieved successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        authProvider: user.authProvider,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    
    // Find the user
    const user = await User.findOne({ id: req.user.id });
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        message: 'Name and email are required'
      });
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await User.findOne({ 
        email: email,
        id: { $ne: req.user.id }
      });
      
      if (existingUser) {
        return res.status(400).json({
          message: 'Email is already in use by another account'
        });
      }
    }

    // Handle password change
    let hashedPassword = user.password;
    if (newPassword) {
      // Google users cannot change password
      if (user.authProvider === 'google') {
        return res.status(400).json({
          message: 'Password cannot be changed for Google-authenticated accounts'
        });
      }

      if (!currentPassword) {
        return res.status(400).json({
          message: 'Current password is required to set a new password'
        });
      }

      // Verify current password (skip for Google users with placeholder password)
      if (user.password !== 'google-oauth-user') {
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
          return res.status(400).json({
            message: 'Current password is incorrect'
          });
        }
      }

      // Validate new password
      if (newPassword.length < 6) {
        return res.status(400).json({
          message: 'New password must be at least 6 characters long'
        });
      }

      // Hash new password
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { id: req.user.id },
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword
      },
      { 
        new: true,
        runValidators: true
      }
    ).select('-password');

    console.log(`User profile updated: ${req.user.id}`);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        authProvider: updatedUser.authProvider,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;