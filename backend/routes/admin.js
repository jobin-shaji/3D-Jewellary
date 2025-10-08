const express = require('express');
const Product = require('../models/product');
const User = require('../models/user');
const OrderService = require('../services/orderService');
const { authenticateToken } = require('../utils/jwt');
const router = express.Router();

// GET /api/admin/stats - Get admin dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ is_active: true });
    const totalUsers = await User.countDocuments();

    // Get real order statistics
    const orderStats = await OrderService.getOrderStats();

    const stats = {
      totalProducts,
      activeProducts,
      totalUsers,
      totalOrders: orderStats.totalOrders,
      pendingOrders: orderStats.pendingOrders,
      completedOrders: orderStats.completedOrders,
      cancelledOrders: orderStats.cancelledOrders,
      totalRevenue: orderStats.totalRevenue,
      recentOrders: orderStats.recentOrders
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

// GET /api/admin/orders - Get all orders for admin
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const {
      page = 1,
      limit = 20,
      status,
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate
    } = req.query;

    console.log('Admin fetching all orders with filters:', { status, userId, startDate, endDate });

    const result = await OrderService.getAllOrders({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      userId,
      sortBy,
      sortOrder,
      startDate,
      endDate
    });

    res.status(200).json({
      message: 'Orders fetched successfully',
      orders: result.orders,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
});

// GET /api/admin/orders/:orderId - Get specific order details for admin
router.get('/orders/:orderId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { orderId } = req.params;

    console.log(`Admin fetching order details: ${orderId}`);

    // Admin can view any order without userId restriction
    const order = await OrderService.getOrderById(orderId);

    res.status(200).json({
      message: 'Order fetched successfully',
      order
    });

  } catch (error) {
    console.error('Error fetching order for admin:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch order details',
      message: error.message
    });
  }
});

// PUT /api/admin/orders/:orderId/status - Update order status
router.put('/orders/:orderId/status', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { orderId } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        message: 'Status is required'
      });
    }

    console.log(`Admin updating order ${orderId} status to: ${status}`);

    const updatedOrder = await OrderService.updateOrderStatus(
      orderId,
      status,
      req.user.id,
      notes || `Status updated by admin ${req.user.name || req.user.id}`
    );

    res.status(200).json({
      message: 'Order status updated successfully',
      order: {
        orderId: updatedOrder.orderId,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt,
        orderHistory: updatedOrder.orderHistory
      }
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    if (error.message.includes('Invalid')) {
      return res.status(400).json({
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to update order status',
      message: error.message
    });
  }
});

module.exports = router;