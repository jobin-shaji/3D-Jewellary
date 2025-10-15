const express = require('express');
const Category = require('../models/category');
const authenticateToken = require('../utils/jwt').authenticateToken;

const router = express.Router();


// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ is_active: true })
      .sort({ sort_order: 1, name: 1 });

    console.log('Categories found:', categories.length);
    res.json(categories);

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single category by ID
router.get('/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);

    const category = await Category.findOne({ id: categoryId })
      .populate('children');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;