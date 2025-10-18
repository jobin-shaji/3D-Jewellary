const express = require('express');
const { authenticateToken, isAdmin } = require('../utils/jwt');
const AnalyticsService = require('../services/analyticsService');

const router = express.Router();

/**
 * @route   GET /api/analytics/overview
 * @desc    Get overview analytics (revenue, orders, users, inventory)
 * @access  Private (Admin only)
 * @query   period - '7d', '30d', '90d', '1y', 'all' (default: '30d')
 */
router.get('/overview', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Validate period
    const validPeriods = ['7d', '30d', '90d', '1y', 'all'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        message: 'Invalid period. Valid options: 7d, 30d, 90d, 1y, all'
      });
    }

    const overview = await AnalyticsService.getOverview(period);

    res.status(200).json({
      message: 'Overview analytics fetched successfully',
      period,
      data: overview
    });

  } catch (error) {
    console.error('Error fetching overview analytics:', error);
    res.status(500).json({
      message: 'Failed to fetch overview analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/analytics/sales-trends
 * @desc    Get sales trends over time
 * @access  Private (Admin only)
 * @query   period - '7d', '30d', '90d', '1y', 'all' (default: '30d')
 * @query   interval - 'day', 'week', 'month' (default: 'day')
 */
router.get('/sales-trends', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { period = '30d', interval = 'day' } = req.query;

    // Validate period
    const validPeriods = ['7d', '30d', '90d', '1y', 'all'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        message: 'Invalid period. Valid options: 7d, 30d, 90d, 1y, all'
      });
    }

    // Validate interval
    const validIntervals = ['day', 'week', 'month'];
    if (!validIntervals.includes(interval)) {
      return res.status(400).json({
        message: 'Invalid interval. Valid options: day, week, month'
      });
    }

    const salesTrends = await AnalyticsService.getSalesTrends(period, interval);

    res.status(200).json({
      message: 'Sales trends fetched successfully',
      period,
      interval,
      data: salesTrends
    });

  } catch (error) {
    console.error('Error fetching sales trends:', error);
    res.status(500).json({
      message: 'Failed to fetch sales trends',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/analytics/user-growth
 * @desc    Get user growth trends over time
 * @access  Private (Admin only)
 * @query   period - '7d', '30d', '90d', '1y', 'all' (default: '30d')
 * @query   interval - 'day', 'week', 'month' (default: 'day')
 */
router.get('/user-growth', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { period = '30d', interval = 'day' } = req.query;

    // Validate period
    const validPeriods = ['7d', '30d', '90d', '1y', 'all'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        message: 'Invalid period. Valid options: 7d, 30d, 90d, 1y, all'
      });
    }

    // Validate interval
    const validIntervals = ['day', 'week', 'month'];
    if (!validIntervals.includes(interval)) {
      return res.status(400).json({
        message: 'Invalid interval. Valid options: day, week, month'
      });
    }

    const userGrowth = await AnalyticsService.getUserGrowth(period, interval);

    res.status(200).json({
      message: 'User growth trends fetched successfully',
      period,
      interval,
      data: userGrowth
    });

  } catch (error) {
    console.error('Error fetching user growth trends:', error);
    res.status(500).json({
      message: 'Failed to fetch user growth trends',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/analytics/inventory
 * @desc    Get inventory statistics
 * @access  Private (Admin only)
 */
router.get('/inventory', authenticateToken, isAdmin, async (req, res) => {
  try {
    const inventoryStats = await AnalyticsService.getInventoryStats();

    res.status(200).json({
      message: 'Inventory statistics fetched successfully',
      data: inventoryStats
    });

  } catch (error) {
    console.error('Error fetching inventory statistics:', error);
    res.status(500).json({
      message: 'Failed to fetch inventory statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/analytics/best-sellers
 * @desc    Get best selling products
 * @access  Private (Admin only)
 * @query   period - '7d', '30d', '90d', '1y', 'all' (default: '30d')
 * @query   limit - Number of products to return (default: 5)
 */
router.get('/best-sellers', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { period = '30d', limit = 5 } = req.query;

    // Validate period
    const validPeriods = ['7d', '30d', '90d', '1y', 'all'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        message: 'Invalid period. Valid options: 7d, 30d, 90d, 1y, all'
      });
    }

    // Validate and parse limit
    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      return res.status(400).json({
        message: 'Invalid limit. Must be between 1 and 50.'
      });
    }

    const bestSellers = await AnalyticsService.getBestSellers(period, parsedLimit);

    res.status(200).json({
      message: 'Best sellers fetched successfully',
      period,
      data: bestSellers
    });

  } catch (error) {
    console.error('Error fetching best sellers:', error);
    res.status(500).json({
      message: 'Failed to fetch best sellers',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
