const Cart = require('../models/cart');
const Product = require('../models/product');

class CartService {
  /**
   * Validate if a product variant exists and has sufficient stock
   * @param {string} productId - Product ID
   * @param {string} variant_id - Variant ID (can be same as productId for non-variant products)
   * @param {number} requestedQuantity - Requested quantity
   * @returns {Object} - Validation result with product and variant data
   */
  static async validateProductVariant(productId, variant_id, requestedQuantity = 1) {
    try {
      console.log(`🔍 Looking for product with ID: ${productId}`);
      
      // Debug: Check what products exist
      const allProducts = await Product.find({}, 'id name');
      console.log(`📋 Available products:`, allProducts.map(p => ({ id: p.id, name: p.name })));
      
      // Find the product
      console.log('🔍 Searching for product:', productId);
      const product = await Product.findOne({ id: productId });
      console.log('🔍 Product found:', product ? product.name : 'NOT FOUND');
      if (!product) {
        return {
          isValid: false,
          error: 'Product not found'
        };
      }

      // Check if product is active
      if (!product.is_active) {
        return {
          isValid: false,
          error: 'Product is not available'
        };
      }

      let variant;
      let stockQuantity;
      let totalPrice;
      let variantName;

      // Check if product has variants
      if (product.variants && product.variants.length > 0) {
        // Product has variants - find the specific variant
        variant = product.variants.find(v => v.variant_id === variant_id);
        if (!variant) {
          return {
            isValid: false,
            error: 'Product variant not found'
          };
        }
        stockQuantity = variant.stock_quantity;
        totalPrice = variant.totalPrice;
        variantName = variant.name;
      } else {
        // Product has no variants - treat product itself as default variant
        // variant_id should match productId for non-variant products
        if (variant_id !== productId) {
          return {
            isValid: false,
            error: 'Product variant not found'
          };
        }
        
        // Create a virtual variant object for consistency
        variant = {
          variant_id: productId,
          name: product.name,
          stock_quantity: product.stock_quantity || 0,
          totalPrice: product.totalPrice || 0
        };
        stockQuantity = product.stock_quantity || 0;
        totalPrice = product.totalPrice || 0;
        variantName = product.name;
      }

      // Check stock availability
      if (stockQuantity < requestedQuantity) {
        return {
          isValid: false,
          error: `Insufficient stock. Available: ${stockQuantity}, Requested: ${requestedQuantity}`
        };
      }

      return {
        isValid: true,
        product,
        variant: {
          ...variant,
          stock_quantity: stockQuantity,
          totalPrice,
          name: variantName
        }
      };
    } catch (error) {
      console.error('Error validating product variant:', error);
      return {
        isValid: false,
        error: 'Error validating product variant'
      };
    }
  }

  /**
   * Get or create cart for a user
   * @param {string} userId - User ID
   * @returns {Object} - Cart document
   */
  static async getOrCreateCart(userId) {
    try {
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({
          userId,
          items: [],
          totalItems: 0,
          totalAmount: 0
        });
        await cart.save();
      }
      return cart;
    } catch (error) {
      console.error('Error getting or creating cart:', error);
      throw new Error('Failed to access cart');
    }
  }

  /**
   * Add item to cart or update quantity if item exists
   * @param {string} userId - User ID
   * @param {Object} itemData - Item data {productId, variant_id, quantity}
   * @returns {Object} - Updated cart
   */
  static async addItemToCart(userId, itemData) {
    const { productId, variant_id, quantity = 1 } = itemData;

    // Validate product variant
    const validation = await this.validateProductVariant(productId, variant_id, quantity);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const { product, variant } = validation;

    // Get or create cart
    const cart = await this.getOrCreateCart(userId);

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === productId && item.variant_id === variant_id
    );

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      // Validate total quantity against stock
      const stockValidation = await this.validateProductVariant(productId, variant_id, newQuantity);
      if (!stockValidation.isValid) {
        throw new Error(stockValidation.error);
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      const itemName = product.variants && product.variants.length > 0 
        ? `${product.name} - ${variant.name}` 
        : variant.name; // For non-variant products, use product name directly
        
      cart.items.push({
        productId,
        variant_id,
        name: itemName,
        priceAtPurchase: variant.totalPrice,
        quantity
      });
    }

    await cart.save();
    return cart;
  }

  /**
   * Update item quantity in cart
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @param {string} variant_id - Variant ID
   * @param {number} quantity - New quantity (0 to remove)
   * @returns {Object} - Updated cart
   */
  static async updateCartItem(userId, productId, variant_id, quantity) {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId === productId && item.variant_id === variant_id
    );

    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }

    if (quantity === 0) {
      // Remove item from cart
      cart.items.splice(itemIndex, 1);
    } else {
      // Validate new quantity against stock
      const validation = await this.validateProductVariant(productId, variant_id, quantity);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    return cart;
  }

  /**
   * Get user's cart with product images
   * @param {string} userId - User ID
   * @returns {Object} - Cart document with populated product images
   */
  static async getCart(userId) {
    const cart = await this.getOrCreateCart(userId);

    // Populate cart items with product images
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const product = await Product.findOne({ id: item.productId });
          if (!product) {
            return item; // Return item as-is if product not found
          }

          // Find primary image or first image
          const primaryImage = product.images.find(img => img.is_primary) || product.images[0];

          return {
            ...item.toObject(),
            image: primaryImage ? {
              image_url: primaryImage.image_url,
              alt_text: primaryImage.alt_text || product.name
            } : null
          };
        } catch (error) {
          console.error(`Error fetching image for product ${item.productId}:`, error);
          return item; // Return item as-is on error
        }
      })
    );

    return {
      ...cart.toObject(),
      items: populatedItems
    };
  }

  /**
   * Clear user's cart
   * @param {string} userId - User ID
   * @returns {Object} - Cleared cart
   */
  static async clearCart(userId) {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items = [];
    await cart.save();
    return cart;
  }

  /**
   * Get cart item count for a user
   * @param {string} userId - User ID
   * @returns {number} - Total items count
   */
  static async getCartItemCount(userId) {
    const cart = await Cart.findOne({ userId });
    return cart ? cart.totalItems : 0;
  }

  /**
   * Remove items that are no longer available (cleanup utility)
   * @param {string} userId - User ID
   * @returns {Object} - Updated cart
   */
  static async cleanupCart(userId) {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return null;
    }

    const validItems = [];
    
    for (const item of cart.items) {
      const validation = await this.validateProductVariant(
        item.productId, 
        item.variant_id, 
        item.quantity
      );
      
      if (validation.isValid) {
        validItems.push(item);
      }
    }

    cart.items = validItems;
    await cart.save();
    return cart;
  }
}

module.exports = CartService;