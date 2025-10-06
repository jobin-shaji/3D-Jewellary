const express = require('express');
const Product = require('../models/product');
const User = require('../models/user');
const { authenticateToken } = require('../utils/jwt');
const router = express.Router();

// GET /api/admin/stats - Get admin dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total products count
    const totalProducts = await Product.countDocuments();
    
    // Get active products count (assuming products with is_active: true are active)
    const activeProducts = await Product.countDocuments({ is_active: true });

    //     const activeProducts = await Product.countDocuments({ 
    //   $or: [
    //     { availability: true },
    //     { availability: { $exists: false } } // Include products where availability is not set
    //   ]
    // });

    // Get active products count (assuming products with is_active: true are active)
    const totalUsers = await User.countDocuments();

    const stats = {
      totalProducts,
      activeProducts,
      totalUsers,
      // Mock data for users and orders as requested
      totalOrders: 189
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch admin statistics',
      message: error.message 
    });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const users = await User.find({})
      .select('-password') // Exclude password from response
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      message: error.message 
    });
  }
});

// PUT /api/admin/users/:id/toggle-active - Toggle user active status
router.put('/users/:id/toggle-active', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const userId = req.params.id;
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle the isActive status
    user.isActive = !user.isActive;
    await user.save();

    // Return user without password
    const { password, ...userWithoutPassword } = user.toObject();
    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error toggling user active status:', error);
    res.status(500).json({ 
      error: 'Failed to toggle user active status',
      message: error.message 
    });
  }
});

// PUT /api/admin/users/:id/change-role - Change user role
router.put('/users/:id/change-role', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const userId = req.params.id;
    const { role } = req.body;

    // Validate role
    if (!role || !['admin', 'client'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be either "admin" or "client"' });
    }

    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent changing own role
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    user.role = role;
    await user.save();

    // Return user without password
    const { password, ...userWithoutPassword } = user.toObject();
    res.json({
      message: `User role changed to ${role} successfully`,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error changing user role:', error);
    res.status(500).json({ 
      error: 'Failed to change user role',
      message: error.message 
    });
  }
});

module.exports = router;