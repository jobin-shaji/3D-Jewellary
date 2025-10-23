const connectToDatabase = require('../utils/mongodb');
const Address = require('../models/address');

module.exports = async (req, res) => {
  await connectToDatabase();

  // GET /api/addresses?userId=USER_ID - get user's addresses
  if (req.method === 'GET' && req.query.userId) {
    try {
      const addresses = await Address.find({ user: req.query.userId });
      res.status(200).json({ addresses });
    } catch (error) {
      console.error('Get addresses error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // POST /api/addresses - add a new address
  if (req.method === 'POST') {
    try {
      const { userId, address } = req.body;
      if (!userId || !address) {
        return res.status(400).json({ message: 'userId and address required' });
      }
      const newAddress = new Address({ user: userId, ...address });
      await newAddress.save();
      res.status(201).json({ message: 'Address added', address: newAddress });
    } catch (error) {
      console.error('Add address error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // PUT /api/addresses?id=ADDRESS_ID - update an address
  if (req.method === 'PUT' && req.query.id) {
    try {
      const addressId = req.query.id;
      const updateData = req.body;
      const updatedAddress = await Address.findByIdAndUpdate(addressId, updateData, { new: true });
      if (!updatedAddress) {
        return res.status(404).json({ message: 'Address not found' });
      }
      res.status(200).json({ message: 'Address updated', address: updatedAddress });
    } catch (error) {
      console.error('Update address error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // DELETE /api/addresses?id=ADDRESS_ID - delete an address
  if (req.method === 'DELETE' && req.query.id) {
    try {
      const addressId = req.query.id;
      const deletedAddress = await Address.findByIdAndDelete(addressId);
      if (!deletedAddress) {
        return res.status(404).json({ message: 'Address not found' });
      }
      res.status(200).json({ message: 'Address deleted', deletedAddressId: addressId });
    } catch (error) {
      console.error('Delete address error:', error);
      res.status(500).json({ message: 'Server error' });
    }
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
};
