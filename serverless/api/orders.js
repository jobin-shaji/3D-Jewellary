const connectToDatabase = require('../utils/mongodb');
const Order = require('../models/order');

module.exports = async (req, res) => {
  await connectToDatabase();

  // GET /api/orders?userId=USER_ID - get user's orders
  if (req.method === 'GET' && req.query.userId) {
    try {
      const orders = await Order.find({ user: req.query.userId });
      res.status(200).json({ orders });
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // POST /api/orders - create a new order
  if (req.method === 'POST') {
    try {
      const { userId, items, total, address } = req.body;
      if (!userId || !Array.isArray(items) || !total || !address) {
        return res.status(400).json({ message: 'userId, items, total, and address required' });
      }
      const order = new Order({ user: userId, items, total, address });
      await order.save();
      res.status(201).json({ message: 'Order created', order });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // PUT /api/orders?id=ORDER_ID - update an order
  if (req.method === 'PUT' && req.query.id) {
    try {
      const orderId = req.query.id;
      const updateData = req.body;
      const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.status(200).json({ message: 'Order updated', order: updatedOrder });
    } catch (error) {
      console.error('Update order error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // DELETE /api/orders?id=ORDER_ID - delete an order
  if (req.method === 'DELETE' && req.query.id) {
    try {
      const orderId = req.query.id;
      const deletedOrder = await Order.findByIdAndDelete(orderId);
      if (!deletedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.status(200).json({ message: 'Order deleted', deletedOrderId: orderId });
    } catch (error) {
      console.error('Delete order error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
};
