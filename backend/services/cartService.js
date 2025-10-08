const Cart = require("../models/cart");
const Product = require("../models/product");
const User = require("../models/user");

class CartService {
  /**
   * Validate if a product variant exists and has sufficient stock
   * @param {string} productId - Product ID
   * @param {string} variant_id - Variant ID (can be same as productId for non-variant products)
   * @param {number} requestedQuantity - Requested quantity
   * @returns {Object} - Validation result with product and variant data
   */
  static async validateProductVariant(
    productId,
    variant_id,
    requestedQuantity = 1
  ) {
    try {
      console.log(`Looking for product with ID: ${productId}`);

      // Debug: Check what products exist
      const allProducts = await Product.find({}, "id name");
      console.log(
        `Available products:`,
        allProducts.map((p) => ({ id: p.id, name: p.name }))
      );

      // Find the product
      console.log("Searching for product:", productId);
      const product = await Product.findOne({ id: productId });
      console.log("Product found:", product ? product.name : "NOT FOUND");
      if (!product) {
        return {
          isValid: false,
          error: "Product not found",
        };
      }

      if (!product.is_active) {
        return {
          isValid: false,
          error: "Product is not available",
        };
      }

      let variant;
      let stockQuantity;
      let totalPrice;
      let variantName;

      // Check if product has variants
      if (product.variants && product.variants.length > 0) {
        // Product has variants - find the specific variant
        variant = product.variants.find((v) => v.variant_id === variant_id);
        if (!variant) {
          return {
            isValid: false,
            error: "Product variant not found",
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
            error: "Product variant not found",
          };
        }

        // Create a virtual variant object for consistency
        variant = {
          variant_id: productId,
          name: product.name,
          stock_quantity: product.stock_quantity || 0,
          totalPrice: product.totalPrice || 0,
        };
        stockQuantity = product.stock_quantity || 0;
        totalPrice = product.totalPrice || 0;
        variantName = product.name;
      }

      // Check stock availability
      if (stockQuantity < requestedQuantity) {
        return {
          isValid: false,
          error: `Insufficient stock. Available: ${stockQuantity}, Requested: ${requestedQuantity}`,
        };
      }

      return {
        isValid: true,
        product,
        variant: {
          ...variant,
          stock_quantity: stockQuantity,
          totalPrice,
          name: variantName,
        },
      };
    } catch (error) {
      console.error("Error validating product variant:", error);
      return {
        isValid: false,
        error: "Error validating product variant",
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
      // Check user role before proceeding
      const user = await User.findOne({ id: userId });
      if (!user) {
        throw new Error("User not found");
      }
      if (user.role === "admin") {
        throw new Error("Admins are not allowed to have a cart");
      }

      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({
          userId,
          items: [],
          totalItems: 0,
          totalAmount: 0,
        });
        await cart.save();
      }
      return cart;
    } catch (error) {
      console.error("Error getting or creating cart:", error);
      throw new Error("Failed to access cart");
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
    const validation = await this.validateProductVariant(
      productId,
      variant_id,
      quantity
    );
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const { product, variant } = validation;

    // Get or create cart
    const cart = await this.getOrCreateCart(userId);

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.variant_id === variant_id
    );

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      // Validate total quantity against stock
      const stockValidation = await this.validateProductVariant(
        productId,
        variant_id,
        newQuantity
      );
      if (!stockValidation.isValid) {
        throw new Error(stockValidation.error);
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      const itemName =
        product.variants && product.variants.length > 0
          ? `${product.name} - ${variant.name}`
          : variant.name; // For non-variant products, use product name directly

      cart.items.push({
        productId,
        variant_id,
        name: itemName,
        totalprice: variant.totalPrice,
        quantity,
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
      throw new Error("Cart not found");
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.variant_id === variant_id
    );

    if (itemIndex === -1) {
      throw new Error("Item not found in cart");
    }

    if (quantity === 0) {
      // Remove item from cart
      cart.items.splice(itemIndex, 1);
    } else {
      // Validate new quantity against stock
      const validation = await this.validateProductVariant(
        productId,
        variant_id,
        quantity
      );
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

  await cart.save();
  }

  /**
   * Get user's cart with product images
   * @param {string} userId - User ID
   * @returns {Object} - Cart document with populated product images
   */
  static async getCart(userId) {
    const cart = await this.getOrCreateCart(userId);
    let cartChanged = false;
    const validItems = [];

    // Process each cart item and check if product is still active
    for (let idx = 0; idx < cart.items.length; idx++) {
      const item = cart.items[idx];
      try {
        // Only fetch active products - treat inactive products same as deleted
        const product = await Product.findOne({ 
          id: item.productId,
          is_active: true 
        });
        
        if (!product) {
          // Product is deleted or inactive - skip this item (will be removed from cart)
          console.log(`Removing cart item for deleted/inactive product: ${item.productId}`);
          cartChanged = true;
          continue;
        }

        // Validate that the specific variant is still available
        const validation = await this.validateProductVariant(
          item.productId,
          item.variant_id,
          item.quantity
        );

        if (!validation.isValid) {
          // Variant is no longer available or insufficient stock - skip this item
          console.log(`Removing cart item for unavailable variant: ${item.productId}/${item.variant_id} - ${validation.error}`);
          cartChanged = true;
          continue;
        }

        // Get latest price for this variant or product
        let latestPrice = 0;
        if (product.variants && product.variants.length > 0) {
          const variant = product.variants.find((v) => v.variant_id === item.variant_id);
          if (variant) latestPrice = variant.totalPrice;
        } else {
          latestPrice = product.totalPrice;
        }

        // If price has changed, update it in the cart
        if (typeof latestPrice === 'number' && item.totalprice !== latestPrice) {
          cart.items[idx].totalprice = latestPrice;
          cartChanged = true;
        }

        // Find primary image or first image
        const primaryImage =
          product.images.find((img) => img.is_primary) || product.images[0];

        const populatedItem = {
          ...item.toObject(),
          totalprice: latestPrice || item.totalprice,
          image: primaryImage
            ? {
                image_url: primaryImage.image_url,
                alt_text: primaryImage.alt_text || product.name,
              }
            : null,
        };

        validItems.push(populatedItem);
      } catch (error) {
        console.error(
          `Error processing cart item for product ${item.productId}:`,
          error
        );
        // On error, remove the item to be safe
        cartChanged = true;
      }
    }

    // If cart changed (items removed or prices updated), update the cart in database
    if (cartChanged) {
      cart.items = cart.items.filter((item) => {
        // Keep only items that are in validItems
        return validItems.some(validItem => 
          validItem.productId === item.productId && 
          validItem.variant_id === item.variant_id
        );
      });
      await cart.save();
    }

    return {
      ...cart.toObject(),
      items: validItems,
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
      throw new Error("Cart not found");
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
      } else {
        console.log(`Cleaning up cart item: ${item.productId}/${item.variant_id} - ${validation.error}`);
      }
    }

    cart.items = validItems;
    await cart.save();
    return cart;
  }
}

module.exports = CartService;
