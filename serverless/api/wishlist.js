const connectToDatabase = require('../utils/mongodb');
const Wishlist = require('../models/wishlist');

module.exports = async (req, res) => {
  await connectToDatabase();

  // GET /api/wishlist?userId=USER_ID - get user's wishlist
  if (req.method === 'GET' && req.query.userId) {
    try {
      const wishlist = await Wishlist.findOne({ user: req.query.userId });
      res.status(200).json({ wishlist });
    } catch (error) {
      console.error('Get wishlist error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // POST /api/wishlist - add/update wishlist
  if (req.method === 'POST') {
    try {
      const { userId, products } = req.body;
      if (!userId || !Array.isArray(products)) {
        return res.status(400).json({ message: 'userId and products array required' });
      }
      let wishlist = await Wishlist.findOne({ user: userId });
      if (wishlist) {
        wishlist.products = products;
      } else {
        wishlist = new Wishlist({ user: userId, products });
      }
      await wishlist.save();
      res.status(201).json({ message: 'Wishlist saved', wishlist });
    } catch (error) {
      console.error('Save wishlist error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // DELETE /api/wishlist?userId=USER_ID - clear user's wishlist
  if (req.method === 'DELETE' && req.query.userId) {
    try {
      const wishlist = await Wishlist.findOneAndDelete({ user: req.query.userId });
      res.status(200).json({ message: 'Wishlist deleted', deletedWishlistId: wishlist?._id });
    } catch (error) {
      console.error('Delete wishlist error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
};
