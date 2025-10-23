const connectToDatabase = require('../utils/mongodb');
const Product = require('../models/product');
const { computeProductPrice } = require('../utils/priceUtils');

module.exports = async (req, res) => {
  await connectToDatabase();

  // POST /api/pricing - calculate product price
  if (req.method === 'POST') {
    try {
      const productData = req.body;
      if (!productData) {
        return res.status(400).json({ message: 'Product data required' });
      }
      const priceResult = await computeProductPrice(productData);
      res.status(200).json(priceResult);
    } catch (error) {
      console.error('Price calculation error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
};
