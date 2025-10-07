const express = require("express");
const Metal = require("../models/metal");
const Product = require("../models/product");
const { computeProductPrice } = require("../utils/priceUtils");

const router = express.Router();

/**
 * POST /api/pricing/compute-price
 * @desc Compute product price based on current metal prices and product specifications
 * @body { productId, selectedVariant }
 * @access Public
 *
 * Computes comprehensive product pricing including metals, gemstones, making charges, and taxes
 */
router.post("/compute-price", async (req, res) => {
  try {
    const { productId } = req.body || {};

    // Validate productId input
    if (productId) {
      // Fetch the product from database to ensure we have latest data
      const product = await Product.findOne({ id: productId });
      if (!product) {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        });
      }

      // Compute product price using current metal prices from database
      const result = await computeProductPrice(product, {
        taxPercent: Number(product.taxPercent || 3),
      });
      const latest = await Metal.findOne().sort({ updatedAt: -1 });

      // Return array format with lastUpdated timestamp
      return res.json({
        success: true,
        data: result.data.map((item) => ({
          ...item,
          lastUpdated: latest ? latest.updatedAt.toISOString() : null,
        })),
      });
    }

    // If no productId provided, return error
    return res.status(400).json({
      success: false,
      error: "Product ID is required for price computation",
    });
  } catch (error) {
    console.error("Error in compute-price:", error);
    res.status(500).json({
      success: false,
      error: "Failed to compute price",
      message: error.message,
    });
  }
});

module.exports = router;
