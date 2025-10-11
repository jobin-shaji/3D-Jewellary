const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { authenticateToken } = require('../utils/jwt');
const OrderService = require('../services/orderService');
const Order = require('../models/order');

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @route   POST /api/payments/create-order
 * @desc    Create a Razorpay order and corresponding order in database
 * @access  Private
 */
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderData = req.body;

    console.log(`Creating payment order for user: ${userId}`);

    // Validate required fields
    if (!orderData.address) {
      return res.status(400).json({
        message: 'Shipping address is required'
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

    // Create order in our database with pending status
    const order = await OrderService.createOrder(userId, {
      ...orderData,
      paymentMethod: 'razorpay'
    });

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(orderData.total * 100), // Amount in paise
      currency: 'INR',
      receipt: order.orderId,
      notes: {
        orderId: order.orderId,
        userId: userId
      }
    });

    // Update order with Razorpay order ID
    await Order.findOneAndUpdate(
      { orderId: order.orderId },
      { 
        'payment.transactionId': razorpayOrder.id,
        'payment.paymentStatus': 'processing'
      }
    );

    console.log(`Razorpay order created: ${razorpayOrder.id} for order: ${order.orderId}`);

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        orderId: order.orderId,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating payment order:', error);
    
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
      message: 'Failed to create payment order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/payments/verify
 * @desc    Verify Razorpay payment and update order status
 * @access  Private
 */
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    console.log(`Verifying payment for order: ${orderId}`);

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Payment signature verification failed');
      
      // Update order as failed
      await OrderService.updatePaymentStatus(
        orderId,
        'failed',
        'Payment signature verification failed'
      );

      return res.status(400).json({
        message: 'Payment verification failed',
        success: false
      });
    }

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    // Save the actual payment method used (upi, card, wallet, etc.)
    if (payment && payment.method) {
      await Order.findOneAndUpdate(
        { orderId },
        { 'payment.method': payment.method }
      );
    }

    if (payment.status === 'captured') {
      // Update order status to placed and payment as completed
      await OrderService.updatePaymentStatus(
        orderId,
        'completed',
        `Payment successful. Payment ID: ${razorpay_payment_id}`
      );

      // Update order status to placed
      await OrderService.updateOrderStatus(
        orderId,
        'placed',
        'system',
        'order placed successfully'
      );

      console.log(`Payment verified successfully for order: ${orderId}`);

      res.status(200).json({
        message: 'Payment verified successfully',
        success: true,
        orderId: orderId,
        paymentId: razorpay_payment_id
      });

    } else {
      // Payment not captured
      await OrderService.updatePaymentStatus(
        orderId,
        'failed',
        `Payment not captured. Status: ${payment.status}`
      );

      res.status(400).json({
        message: 'Payment not completed',
        success: false
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);

    // Try to update order as failed if orderId is available
    if (req.body.orderId) {
      try {
        await OrderService.updatePaymentStatus(
          req.body.orderId,
          'failed',
          'Payment verification error'
        );
      } catch (updateError) {
        console.error('Error updating payment status:', updateError);
      }
    }

    res.status(500).json({
      message: 'Payment verification failed',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Razorpay webhooks
 * @access  Public (but secured with webhook signature)
 */
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const webhookSignature = req.get('X-Razorpay-Signature');
    
    if (webhookSecret) {
      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(req.body)
        .digest('hex');

      if (expectedSignature !== webhookSignature) {
        console.error('Webhook signature verification failed');
        return res.status(400).json({ message: 'Invalid signature' });
      }
    }

    const event = JSON.parse(req.body);
    console.log('Received webhook:', event.event);

    switch (event.event) {
      case 'payment.captured':
        // Handle successful payment
        const paymentEntity = event.payload.payment.entity;
        const orderId = paymentEntity.notes?.orderId;
        
        if (orderId) {
          // Use comprehensive payment success handler (includes cart clearing)
          await OrderService.handlePaymentSuccess(
            orderId,
            paymentEntity.id,
            { source: 'webhook' }
          );
        }
        break;

      case 'payment.failed':
        // Handle failed payment
        const failedPaymentEntity = event.payload.payment.entity;
        const failedOrderId = failedPaymentEntity.notes?.orderId;
        
        if (failedOrderId) {
          await OrderService.updatePaymentStatus(
            failedOrderId,
            'failed',
            `Webhook: Payment failed. Reason: ${failedPaymentEntity.error_description || 'Unknown'}`
          );
        }
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.status(200).json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

module.exports = router;