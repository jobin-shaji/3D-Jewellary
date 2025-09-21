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

// Create new category (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { name, description, image_url, parent_id } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // If parent_id is provided, validate it exists
    if (parent_id) {
      const parentCategory = await Category.findOne({ id: parent_id });
      if (!parentCategory) {
        return res.status(400).json({ message: 'Invalid parent category ID' });
      }
    }

    // Get the next ID for the category
    const lastCategory = await Category.findOne().sort({ id: -1 });
    const nextId = lastCategory ? lastCategory.id + 1 : 1;

    const category = new Category({
      id: nextId,
      name,
      description,
      image_url,
      parent_id
    });

    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;