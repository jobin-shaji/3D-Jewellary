const connectToDatabase = require('../utils/mongodb');
const Order = require('../models/order');
const Product = require('../models/product');

module.exports = async (req, res) => {
  await connectToDatabase();

  // GET /api/analytics/sales - get sales analytics
  if (req.method === 'GET' && req.url.endsWith('/sales')) {
    try {
      const totalOrders = await Order.countDocuments();
      const totalRevenue = await Order.aggregate([
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);
      res.status(200).json({
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      });
    } catch (error) {
      console.error('Sales analytics error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // GET /api/analytics/products - get product analytics
  if (req.method === 'GET' && req.url.endsWith('/products')) {
    try {
      const totalProducts = await Product.countDocuments();
      res.status(200).json({ totalProducts });
    } catch (error) {
      console.error('Product analytics error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
};
