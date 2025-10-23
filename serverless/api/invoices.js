const connectToDatabase = require('../utils/mongodb');
const Order = require('../models/order');

module.exports = async (req, res) => {
  await connectToDatabase();

  // GET /api/invoices?orderId=ORDER_ID - get invoice for an order
  if (req.method === 'GET' && req.query.orderId) {
    try {
      const order = await Order.findById(req.query.orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      // For simplicity, return order as invoice
      res.status(200).json({ invoice: order });
    } catch (error) {
      console.error('Get invoice error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
};
