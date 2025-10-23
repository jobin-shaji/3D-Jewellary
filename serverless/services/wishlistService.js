const User = require("../models/user");
const Product = require("../models/product");

class WishlistService {
  /**
   * Get user's wishlist with populated product details
   * @param {string} userId - User ID
   * @returns {Object} - Wishlist items with product details
   */
  static async getWishlist(userId) {
    try {
      const user = await User.findOne({ id: userId });
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }
      // Get product details for each wishlist item
      const wishlistWithDetails = await Promise.all(
        user.wishlist.map(async (item) => {
          const product = await Product.findOne({ 
            id: item.productId, 
            is_deleted: false 
          }); 
          if (!product) {
            return null; // Product was deleted
          }
          return {
            productId: item.productId,
            addedAt: item.addedAt,
            product: {
              id: product.id,
              name: product.name,
              description: product.description,
              category_id: product.category_id,
              images: product.images,
              is_active: product.is_active,
              stock_quantity: product.stock_quantity,
              makingPrice: product.makingPrice,
            },
          };
        })
      );
      // Filter out null items (deleted products)
      const validWishlist = wishlistWithDetails.filter((item) => item !== null);
      return {
        success: true,
        wishlist: validWishlist,
      };
    } catch (error) {
      console.error("Error getting wishlist:", error);
      return {
        success: false,
        error: "Failed to get wishlist",
      };
    }
  }

  /**
   * Add a product to user's wishlist
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Object} - Success status and message
   */
  static async addToWishlist(userId, productId) {
    try {
      const user = await User.findOne({ id: userId });
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }
      // Check if product exists
      const product = await Product.findOne({ 
        id: productId, 
        is_deleted: false 
      });
      if (!product) {
        return {
          success: false,
          error: "Product not found",
        };
      }
      // Check if item already exists in wishlist
      const existingItem = user.wishlist.find(
        (item) => item.productId === productId
      );
      if (existingItem) {
        return {
          success: false,
          error: "Item already in wishlist",
        };
      }
      // Add to wishlist
      user.wishlist.push({
        productId,
        addedAt: new Date(),
      });
      await user.save();
      return {
        success: true,
        message: "Product added to wishlist",
        wishlist: user.wishlist,
      };
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      return {
        success: false,
        error: "Failed to add to wishlist",
      };
    }
  }

  /**
   * Remove a product from user's wishlist
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Object} - Success status and message
   */
  static async removeFromWishlist(userId, productId) {
    try {
      const user = await User.findOne({ id: userId });
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }
      // Find and remove the item
      const initialLength = user.wishlist.length;
      user.wishlist = user.wishlist.filter(
        (item) => item.productId !== productId
      );
      if (user.wishlist.length === initialLength) {
        return {
          success: false,
          error: "Item not found in wishlist",
        };
      }
      await user.save();
      return {
        success: true,
        message: "Product removed from wishlist",
        wishlist: user.wishlist,
      };
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return {
        success: false,
        error: "Failed to remove from wishlist",
      };
    }
  }

  /**
   * Clear user's entire wishlist
   * @param {string} userId - User ID
   * @returns {Object} - Success status and message
   */
  static async clearWishlist(userId) {
    try {
      const user = await User.findOne({ id: userId });
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      user.wishlist = [];
      await user.save();

      return {
        success: true,
        message: "Wishlist cleared",
      };
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      return {
        success: false,
        error: "Failed to clear wishlist",
      };
    }
  }

  /**
   * Check if a product is in user's wishlist
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Object} - Success status and isInWishlist boolean
   */
  static async isInWishlist(userId, productId) {
    try {
      const user = await User.findOne({ id: userId });
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      const isInWishlist = user.wishlist.some(
        (item) => item.productId === productId
      );

      return {
        success: true,
        isInWishlist,
      };
    } catch (error) {
      console.error("Error checking wishlist:", error);
      return {
        success: false,
        error: "Failed to check wishlist",
      };
    }
  }
}
module.exports = WishlistService;