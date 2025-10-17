const express = require("express");
const router = express.Router();
const WishlistService = require("../services/wishlistService");
const { authenticateToken } = require("../utils/jwt");

/**
 * @route GET /api/wishlist
 * @desc Get user's wishlist
 * @access Private
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await WishlistService.getWishlist(userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.json({
      success: true,
      wishlist: result.wishlist,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
});

/**
 * @route POST /api/wishlist
 * @desc Add a product to wishlist
 * @access Private
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const result = await WishlistService.addToWishlist(userId, productId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.json({
      success: true,
      message: result.message,
      wishlist: result.wishlist,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add to wishlist",
    });
  }
});

/**
 * @route DELETE /api/wishlist
 * @desc Remove a product from wishlist
 * @access Private
 */
router.delete("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const result = await WishlistService.removeFromWishlist(userId, productId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.json({
      success: true,
      message: result.message,
      wishlist: result.wishlist,
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove from wishlist",
    });
  }
});

/**
 * @route DELETE /api/wishlist/clear
 * @desc Clear entire wishlist
 * @access Private
 */
router.delete("/clear", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await WishlistService.clearWishlist(userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
    });
  }
});

/**
 * @route GET /api/wishlist/check/:productId
 * @desc Check if a product is in wishlist
 * @access Private
 */
router.get("/check/:productId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const result = await WishlistService.isInWishlist(userId, productId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.json({
      success: true,
      isInWishlist: result.isInWishlist,
    });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check wishlist",
    });
  }
});

module.exports = router;
