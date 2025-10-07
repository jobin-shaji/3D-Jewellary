const express = require('express');
const { authenticateToken } = require('../utils/jwt');
const CartService = require('../services/cartService');

const router = express.Router();

/**
 * @route   POST /api/cart/add
 * @desc    Add a product variant to user's cart
 * @access  Private (Authenticated users only)
 */
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, variant_id, quantity = 1 } = req.body;

    // Validation
    if (!productId || !variant_id) {
      return res.status(400).json({
        message: 'Product ID and variant ID are required. For products without variants, use productId as variant_id'
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: 'Quantity must be a positive integer'
      });
    }

    console.log(`Adding item to cart - User: ${userId}, Product: ${productId}, Variant: ${variant_id}, Quantity: ${quantity}`);

    // Add item to cart using service
    const updatedCart = await CartService.addItemToCart(userId, {
      productId,
      variant_id,
      quantity
    });

    console.log(`Item added to cart successfully - Total items: ${updatedCart.totalItems}`);

    res.status(200).json({
      message: 'Item added to cart successfully',
      cart: updatedCart
    });

  } catch (error) {
    console.error('Error adding item to cart:', error);
    
    // Handle specific error types
    if (error.message.includes('not found') || error.message.includes('not available')) {
      return res.status(404).json({
        message: error.message
      });
    }
    
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: 'Server error while adding item to cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   PATCH /api/cart/update
 * @desc    Update quantity of an item in cart or remove if quantity is 0
 * @access  Private (Authenticated users only)
 */
router.patch('/update', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, variant_id, quantity } = req.body;

    // Validation
    if (!productId || !variant_id) {
      return res.status(400).json({
        message: 'Product ID and variant ID are required. For products without variants, use productId as variant_id'
      });
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        message: 'Quantity must be a non-negative integer'
      });
    }

    console.log(`Updating cart item - User: ${userId}, Product: ${productId}, Variant: ${variant_id}, New Quantity: ${quantity}`);


    // Update item using service
    await CartService.updateCartItem(userId, productId, variant_id, quantity);

    // Always return the cart using getCart to ensure images are included
    const cartWithImages = await CartService.getCart(userId);

    const action = quantity === 0 ? 'removed from' : 'updated in';
    console.log(`Item ${action} cart successfully - Total items: ${cartWithImages.totalItems}`);

    res.status(200).json({
      message: `Item ${action} cart successfully`,
      cart: cartWithImages
    });

  } catch (error) {
    console.error('Error updating cart item:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        message: error.message
      });
    }
    
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: 'Server error while updating cart item',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/cart
 * @desc    Get all cart items for the logged-in user
 * @access  Private (Authenticated users only)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`Fetching cart - User: ${userId}`);

    // Get cart using service
    const cart = await CartService.getCart(userId);

    console.log(`Cart fetched successfully - Total items: ${cart.totalItems}`);

    res.status(200).json({
      message: 'Cart fetched successfully',
      cart,
      summary: cart.summary
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    
    res.status(500).json({
      message: 'Server error while fetching cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/cart/clear
 * @desc    Clear all items from user's cart
 * @access  Private (Authenticated users only)
 */
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(` Clearing cart - User: ${userId}`);

    // Clear cart using service
    const clearedCart = await CartService.clearCart(userId);

    console.log(`Cart cleared successfully - User: ${userId}`);

    res.status(200).json({
      message: 'Cart cleared successfully',
      cart: clearedCart
    });

  } catch (error) {
    console.error('Error clearing cart:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: 'Server error while clearing cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/cart/count
 * @desc    Get total item count in user's cart (for header badge)
 * @access  Private (Authenticated users only)
 */
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const itemCount = await CartService.getCartItemCount(userId);

    res.status(200).json({
      count: itemCount
    });

  } catch (error) {
    console.error('Error getting cart count:', error);
    
    res.status(500).json({
      message: 'Server error while getting cart count',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/cart/cleanup
 * @desc    Remove unavailable items from cart (utility endpoint)
 * @access  Private (Authenticated users only)
 */
router.post('/cleanup', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`Cleaning up cart - User: ${userId}`);

    const cleanedCart = await CartService.cleanupCart(userId);

    if (!cleanedCart) {
      return res.status(404).json({
        message: 'Cart not found'
      });
    }

    console.log(`Cart cleaned up successfully - User: ${userId}`);

    res.status(200).json({
      message: 'Cart cleaned up successfully',
      cart: cleanedCart
    });

  } catch (error) {
    console.error('Error cleaning up cart:', error);
    
    res.status(500).json({
      message: 'Server error while cleaning up cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;