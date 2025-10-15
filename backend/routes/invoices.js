const express = require('express');
const { authenticateToken } = require('../utils/jwt');
const InvoiceService = require('../services/invoiceService');
const Order = require('../models/order');

const router = express.Router();

/**
 * @route   POST /api/invoices/generate/:orderId
 * @desc    Generate invoice PDF for an order
 * @access  Private (User must own the order or be admin)
 */
router.post('/generate/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // console.log('Invoice generation request for order:', orderId, 'by user:', userId);

    // Validate order exists
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({
        message: 'You do not have permission to access this order invoice'
      });
    }

    // Check if order is in valid state for invoice generation
    if (order.payment.paymentStatus === 'pending' || order.payment.paymentStatus === 'failed') {
      return res.status(400).json({
        message: 'Invoice cannot be generated for unpaid orders'
      });
    }

    // Generate invoice
    const result = await InvoiceService.generateInvoice(orderId);

    res.json({
      message: result.message,
      invoiceUrl: result.invoiceUrl,
      orderId: orderId,
    });

  } catch (error) {
    console.error('Invoice generation error:', error);
    
    // Handle specific error types
    if (error.message.includes('Order not found')) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }
    
    if (error.message.includes('User not found')) {
      return res.status(404).json({
        message: 'User associated with order not found'
      });
    }

    res.status(500).json({
      message: 'Failed to generate invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;