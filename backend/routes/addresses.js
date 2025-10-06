const express = require('express');
const router = express.Router();
const Address = require('../models/address');
const { authenticateToken } = require('../utils/jwt');

// GET /addresses - Get all addresses for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const addresses = await Address.find({ 
      userId: req.user.id, 
      isActive: true 
    }).sort({ isDefault: -1, createdAt: -1 });

    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Error fetching addresses' });
  }
});

// GET /addresses/:id - Get a specific address
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const address = await Address.findOne({
      id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json(address);
  } catch (error) {
    console.error('Error fetching address:', error);
    res.status(500).json({ message: 'Error fetching address' });
  }
});

// POST /addresses - Create a new address
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      firstName,
      lastName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault
    } = req.body;

    // Validation
    if (!title || !firstName || !lastName || !phone || !addressLine1 || !city || !state || !postalCode || !country) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // If this is being set as default, unset all other default addresses for this user
    if (isDefault) {
      await Address.updateMany(
        { userId: req.user.id },
        { isDefault: false }
      );
    }

    const address = new Address({
      userId: req.user.id,
      title,
      firstName,
      lastName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || '',
      city,
      state,
      postalCode,
      country,
      isDefault: isDefault || false,
      isActive: true
    });

    await address.save();
    res.status(201).json(address);
  } catch (error) {
    console.error('Error creating address:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    res.status(500).json({ message: 'Error creating address' });
  }
});

// PUT /addresses/:id - Update an existing address
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      firstName,
      lastName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault
    } = req.body;

    const address = await Address.findOne({
      id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If this is being set as default, unset all other default addresses for this user
    if (isDefault && !address.isDefault) {
      await Address.updateMany(
        { userId: req.user.id, id: { $ne: req.params.id } },
        { isDefault: false }
      );
    }

    // Update the address fields
    if (title !== undefined) address.title = title;
    if (firstName !== undefined) address.firstName = firstName;
    if (lastName !== undefined) address.lastName = lastName;
    if (phone !== undefined) address.phone = phone;
    if (addressLine1 !== undefined) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (postalCode !== undefined) address.postalCode = postalCode;
    if (country !== undefined) address.country = country;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();
    res.json(address);
  } catch (error) {
    console.error('Error updating address:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    res.status(500).json({ message: 'Error updating address' });
  }
});

// PATCH /addresses/:id/default - Set an address as default
router.patch('/:id/default', authenticateToken, async (req, res) => {
  try {
    const address = await Address.findOne({
      id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Unset all other default addresses for this user
    await Address.updateMany(
      { userId: req.user.id },
      { isDefault: false }
    );

    // Set this address as default
    address.isDefault = true;
    await address.save();

    res.json(address);
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ message: 'Error setting default address' });
  }
});

// DELETE /addresses/:id - Soft delete an address
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const address = await Address.findOne({
      id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Check if this is the only address and it's the default
    const userAddressCount = await Address.countDocuments({
      userId: req.user.id,
      isActive: true
    });

    if (userAddressCount === 1) {
      return res.status(400).json({ message: 'Cannot delete the only address. Please add another address first.' });
    }

    // If deleting the default address, set another address as default
    if (address.isDefault) {
      const nextAddress = await Address.findOne({
        userId: req.user.id,
        id: { $ne: req.params.id },
        isActive: true
      }).sort({ createdAt: -1 });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    // Soft delete the address
    address.isActive = false;
    await address.save();

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Error deleting address' });
  }
});

module.exports = router;