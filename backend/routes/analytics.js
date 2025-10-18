const express = require('express');
const { authenticateToken, isAdmin } = require('../utils/jwt');
const AnalyticsService = require('../services/analyticsService');
const { Parser } = require('json2csv');

const router = express.Router();

/**
 * @route   GET /api/analytics/overview
 * @desc    Get overview analytics (revenue, orders, users, inventory) - uses all data
 * @access  Private (Admin only)
 */
router.get('/overview', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Use 'all' period to get complete data
    const overview = await AnalyticsService.getOverview('all');

    res.status(200).json({
      message: 'Overview analytics fetched successfully',
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
 * @query   interval - 'day', 'week', 'month' (optional, auto-determined if not provided)
 */
router.get('/sales-trends', authenticateToken, isAdmin, async (req, res) => {
  try {
    let { period = '30d', interval } = req.query;

    // Validate period
    const validPeriods = ['7d', '30d', '90d', '1y', 'all'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        message: 'Invalid period. Valid options: 7d, 30d, 90d, 1y, all'
      });
    }

    // Auto-determine interval based on period if not provided
    if (!interval) {
      if (period === '7d' || period === '30d') {
        interval = 'day';
      } else if (period === '90d') {
        interval = 'week';
      } else { // '1y' or 'all'
        interval = 'month';
      }
    }

    // Validate interval if provided
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
 * @query   interval - 'day', 'week', 'month' (optional, auto-determined if not provided)
 */
router.get('/user-growth', authenticateToken, isAdmin, async (req, res) => {
  try {
    let { period = '30d', interval } = req.query;

    // Validate period
    const validPeriods = ['7d', '30d', '90d', '1y', 'all'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        message: 'Invalid period. Valid options: 7d, 30d, 90d, 1y, all'
      });
    }

    // Auto-determine interval based on period if not provided
    if (!interval) {
      if (period === '7d' || period === '30d') {
        interval = 'day';
      } else if (period === '90d') {
        interval = 'week';
      } else { // '1y' or 'all'
        interval = 'month';
      }
    }

    // Validate interval if provided
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
 * @desc    Get inventory statistics - uses all data
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

/**
 * @route   GET /api/analytics/revenue/export
 * @desc    Export revenue data as CSV (admin only)
 * @access  Private (Admin only)
 * @query   period - '7d', '30d', '90d', '1y', 'all' (default: 'all')
 */
router.get('/revenue/export', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    // Get all completed orders in the period
    const { startDate, endDate } = AnalyticsService.getDateRange(period);
    const orders = await require('../models/order').find({
      createdAt: { $gte: startDate, $lte: endDate },
      'payment.paymentStatus': 'completed'
    }).lean();

    // Define fields to export
    const fields = [
      'orderId',
      'userId',
      'totalPrice',
      'tax',
      'shippingFee',
      'payment.method',
      'payment.paymentStatus',
      'createdAt',
      'updatedAt',
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(orders);
    res.header('Content-Type', 'text/csv');
    res.attachment('revenue_report.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting revenue report:', error);
    res.status(500).json({
      message: 'Failed to export revenue report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/analytics/tax-report/export
 * @desc    Export tax report as CSV (admin only)
 * @access  Private (Admin only)
 */
router.get('/tax-report/export', authenticateToken, isAdmin, async (req, res) => {
  try {
    const Order = require('../models/order');
    const User = require('../models/user');
    const { Parser } = require('json2csv');
    // Get all completed orders
    const orders = await Order.find({ 'payment.paymentStatus': 'completed' }).lean();
    // Prepare rows
    const rows = await Promise.all(orders.map(async (order) => {
      // Get customer name
      let customerName = '';
      if (order.userId) {
        const user = await User.findOne({ id: order.userId }).lean();
        customerName = user?.name || '';
      }
      // Tax rate (now 3%)
      const taxRate = '3%';
      // Tax type (default IGST, customize as needed)
      const taxType = 'IGST';
      // Subtotal (before tax)
      const subtotal = order.subtotal || (order.totalPrice - order.tax);
      // Tax amount
      const taxAmount = order.tax || Math.round(subtotal * 0.03);
      // Total (after tax)
      const total = subtotal + taxAmount;
      // Format date as DD-MM-YYYY (padded for consistent width)
      const orderDate = order.createdAt ? (() => {
        const d = new Date(order.createdAt);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      })() : '';
      // Format numbers without currency symbol (symbol in heading instead)
      const formatNumber = (value) => Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return {
        'Order ID': order.orderId,
        'Order Date': orderDate,
        'Customer Name': customerName,
        'Subtotal (Before Tax) ₹': formatNumber(subtotal),
        'Tax Rate': taxRate,
        'Tax Amount ₹': formatNumber(taxAmount),
        'Total (After Tax) ₹': formatNumber(total),
        'Tax Type': taxType,
      };
    }));
    // Define fields
    const fields = [
      'Order ID',
      'Order Date',
      'Customer Name',
      'Subtotal (Before Tax) ₹',
      'Tax Rate',
      'Tax Amount ₹',
      'Total (After Tax) ₹',
      'Tax Type',
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(rows);
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('tax_report.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting tax report:', error);
    res.status(500).json({
      message: 'Failed to export tax report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
