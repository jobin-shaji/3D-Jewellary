const connectToDatabase = require('../utils/mongodb');
const User = require('../models/user');
const Product = require('../models/product');

module.exports = async (req, res) => {
  await connectToDatabase();

  // GET /api/admin/users - list all users
  if (req.method === 'GET' && req.url.endsWith('/users')) {
    try {
      const users = await User.find();
      res.status(200).json({ users });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // GET /api/admin/products - list all products
  if (req.method === 'GET' && req.url.endsWith('/products')) {
    try {
      const products = await Product.find();
      res.status(200).json({ products });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
};
