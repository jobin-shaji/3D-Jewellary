const express = require('express');
const Product = require('../models/product');

const router = express.Router();

// Get all products with primary images
router.get('/', async (req, res) => {
  try {
    // Get all active products with limit for performance
    const products = await Product.find({ is_active: true })
      .populate('category')
      .sort({ createdAt: -1 })
      .limit(50);

    // Add primary image for each product
    const productsWithImages = products.map(product => {
      const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
      
      return {
        ...product.toObject(),
        primaryImage: primaryImage
      };
    });

    res.json({
      products: productsWithImages,
      pagination: {
        page: 1,
        limit: products.length,
        total: products.length,
        pages: 1
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product with images populated
router.get('/:id/full', async (req, res) => {
  try {
    const productId = req.params.id;

    // Get product
    const product = await Product.findOne({ id: productId, is_active: true })
      .populate('category');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get primary image (first image or one marked as primary)
    const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];

    res.json({
      ...product.toObject(),
      primaryImage: primaryImage
    });

  } catch (error) {
    console.error('Get product full error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
