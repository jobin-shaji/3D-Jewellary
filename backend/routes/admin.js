const express = require('express');
const Product = require('../models/product');
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

    const stats = {
      totalProducts,
      activeProducts,
      // Mock data for users and orders as requested
      totalUsers: 1526,
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

module.exports = router;