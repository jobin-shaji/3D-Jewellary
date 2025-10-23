const connectToDatabase = require('../utils/mongodb');
const Cart = require('../models/cart');

module.exports = async (req, res) => {
  await connectToDatabase();

  // GET /api/cart?userId=USER_ID - get user's cart
  if (req.method === 'GET' && req.query.userId) {
    try {
      const cart = await Cart.findOne({ user: req.query.userId });
      res.status(200).json({ cart });
    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // POST /api/cart - create or update cart
  if (req.method === 'POST') {
    try {
      const { userId, items } = req.body;
      if (!userId || !Array.isArray(items)) {
        return res.status(400).json({ message: 'userId and items array required' });
      }
      let cart = await Cart.findOne({ user: userId });
      if (cart) {
        cart.items = items;
      } else {
        cart = new Cart({ user: userId, items });
      }
      await cart.save();
      res.status(201).json({ message: 'Cart saved', cart });
    } catch (error) {
      console.error('Save cart error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // DELETE /api/cart?userId=USER_ID - clear user's cart
  if (req.method === 'DELETE' && req.query.userId) {
    try {
      const cart = await Cart.findOneAndDelete({ user: req.query.userId });
      res.status(200).json({ message: 'Cart deleted', deletedCartId: cart?._id });
    } catch (error) {
      console.error('Delete cart error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
};
