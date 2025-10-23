const connectToDatabase = require('../utils/mongodb');
const Order = require('../models/order');

module.exports = async (req, res) => {
  await connectToDatabase();

  // POST /api/payments - process payment (mock)
  if (req.method === 'POST') {
    try {
      const { orderId, paymentDetails } = req.body;
      if (!orderId || !paymentDetails) {
        return res.status(400).json({ message: 'orderId and paymentDetails required' });
      }
      // Mock payment processing
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      order.paymentStatus = 'Paid';
      await order.save();
      res.status(200).json({ message: 'Payment processed', order });
    } catch (error) {
      console.error('Payment error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
};
