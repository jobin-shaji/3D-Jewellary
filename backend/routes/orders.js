const express = require('express');
const { authenticateToken } = require('../utils/jwt');
const OrderService = require('../services/orderService');

const router = express.Router();

/**
 * @route   GET /api/orders
 * @desc    Get all orders for the authenticated user
 * @access  Private (Authenticated users only)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log(`Fetching orders for user: ${userId}`);

    const result = await OrderService.getUserOrders(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      sortBy,
      sortOrder
    });

    res.status(200).json({
      message: 'Orders fetched successfully',
      orders: result.orders,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    
    res.status(500).json({
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/orders/:orderId
 * @desc    Get a specific order by order ID
 * @access  Private (Authenticated users only)
 */
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    console.log(`Fetching order ${orderId} for user: ${userId}`);

    const order = await OrderService.getOrderById(orderId, userId);

    res.status(200).json({
      message: 'Order fetched successfully',
      order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    res.status(500).json({
      message: 'Failed to fetch order details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/orders/:orderId/cancel
 * @desc    Cancel an order (if it's still placed/shipped)
 * @access  Private (Authenticated users only)
 */
router.put('/:orderId/cancel', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    const { reason } = req.body;

    console.log(`Cancelling order ${orderId} for user: ${userId}`);

    // First check if order belongs to user
    const order = await OrderService.getOrderById(orderId, userId);
    
    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'placed', 'shipped'].includes(order.status)) {
      return res.status(400).json({
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status to cancelled
    const updatedOrder = await OrderService.updateOrderStatus(
      orderId,
      'cancelled',
      userId,
      reason || 'Cancelled by customer'
    );

    console.log(`Order ${orderId} cancelled successfully`);

    res.status(200).json({
      message: 'Order cancelled successfully',
      order: {
        orderId: updatedOrder.orderId,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt
      }
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    res.status(500).json({
      message: 'Failed to cancel order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});


module.exports = router;