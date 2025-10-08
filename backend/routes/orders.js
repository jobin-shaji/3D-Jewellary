const express = require('express');
const { authenticateToken } = require('../utils/jwt');
const OrderService = require('../services/orderService');

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order from checkout
 * @access  Private (Authenticated users only)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderData = req.body;

    console.log(`Creating order for user: ${userId}`);

    // Validate required fields
    if (!orderData.address) {
      return res.status(400).json({
        message: 'Shipping address is required'
      });
    }

    if (!orderData.paymentMethod) {
      return res.status(400).json({
        message: 'Payment method is required'
      });
    }

    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res.status(400).json({
        message: 'Order items are required'
      });
    }

    if (!orderData.total || orderData.total <= 0) {
      return res.status(400).json({
        message: 'Order total must be greater than 0'
      });
    }

    // Create the order
    const order = await OrderService.createOrder(userId, orderData);

    console.log(`Order created successfully: ${order.orderId}`);

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        orderId: order.orderId,
        status: order.status,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        estimatedDelivery: calculateEstimatedDelivery(),
        shippingAddress: {
          name: order.shippingAddress.name,
          street: order.shippingAddress.street,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
          phone: order.shippingAddress.phone
        }
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    
    if (error.message.includes('not found') || error.message.includes('not available')) {
      return res.status(404).json({
        message: error.message
      });
    }
    
    if (error.message.includes('No valid items')) {
      return res.status(400).json({
        message: 'Cart contains invalid items. Please refresh and try again.'
      });
    }

    res.status(500).json({
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

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
    if (!['shipped', 'placed'].includes(order.status)) {
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

/**
 * Helper function to calculate estimated delivery date
 */
function calculateEstimatedDelivery() {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from now
  return deliveryDate;
}

module.exports = router;