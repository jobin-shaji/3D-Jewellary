const express = require('express');
const Metal = require('../models/metal');
const { computeProductPrice } = require('../utils/priceUtils');
const { updateMetalPricesFromAPI } = require('./metals');

const router = express.Router();

/**
 * POST /api/pricing/compute-price
 * @desc Compute product price based on current metal prices and product specifications
 * @body { product, selectedVariant, persist, metal, purity, weightGrams, makingCharge, taxPercent }
 * @access Public
 * 
 * Two modes:
 * 1. Full product pricing: Pass { product } object with metals, gemstones, variants
 * 2. Simple metal pricing: Pass { metal, purity, weightGrams, makingCharge, taxPercent }
 */
router.post('/compute-price', async (req, res) => {
  try {
    const { product, metal, purity, weightGrams, makingCharge = 0, taxPercent = 0 } = req.body || {};

    // If full product provided, delegate to computeProductPrice helper
    if (product) {
      // Compute product price using current metal prices from database
      // Note: Metal prices are kept fresh by the frequently called /api/metal/prices endpoint
      const result = await computeProductPrice(product, { taxPercent: Number(product.taxPercent || taxPercent || 3) });
      const latest = await Metal.findOne().sort({ updatedAt: -1 });

      // Optional persist flag: if client requests persistence, save roundedTotal to product document
      // Body may include { persist: true, selectedVariant }
      const { persist, selectedVariant } = req.body || {};
      if (persist && product.id && Array.isArray(result.data)) {
        try {
          const Product = require('../models/product');
          
          // If selectedVariant is provided, persist only that variant's price
          if (selectedVariant?.variant_id) {
            const variantPricing = result.data.find(v => v.variant_id === selectedVariant.variant_id);
            if (variantPricing) {
              // Update the specific variant's totalPrice in the product document
              await Product.findOneAndUpdate(
                { id: product.id, 'variants.variant_id': selectedVariant.variant_id },
                { 
                  $set: { 
                    'variants.$.totalPrice': variantPricing.roundedTotal,
                    latestPriceUpdate: new Date()
                  }
                }
              );
            }
          } else {
            // No specific variant selected - persist base product price (first result)
            const basePricing = result.data[0];
            if (basePricing) {
              await Product.findOneAndUpdate(
                { id: product.id }, 
                { 
                  totalPrice: basePricing.roundedTotal, 
                  latestPriceUpdate: new Date() 
                }
              );
            }
          }
        } catch (errPersist) {
          console.warn('Failed to persist computed price for product', product.id, errPersist.message);
        }
      }

      // Return array format with lastUpdated timestamp
      return res.json({ 
        success: true, 
        data: result.data.map(item => ({
          ...item,
          lastUpdated: latest ? latest.updatedAt.toISOString() : null
        }))
      });
    }

    // Backward compatible single-metal compute path
    if (!metal || !purity || typeof weightGrams !== 'number') {
      return res.status(400).json({ 
        success: false, 
        error: 'Provide either full product object or metal, purity and weightGrams (number)' 
      });
    }

    // Fetch pricePerGram from DB
    // Note: Metal prices are kept fresh by the frequently called /api/metal/prices endpoint
    const metalDoc = await Metal.findOne({ metal, purity });
    if (!metalDoc) {
      return res.status(404).json({ 
        success: false, 
        error: `Price not found for ${metal} ${purity}` 
      });
    }

    const pricePerGram = metalDoc.pricePerGram;

    // Compute components
    const metalValue = pricePerGram * weightGrams;
    const making = Number(makingCharge) || 0;
    const subtotal = metalValue + making;
    const tax = (taxPercent / 100) * subtotal;
    const total = subtotal + tax;

    // Round sensible values
    const round = (v) => Math.round(v * 100) / 100;

    res.json({
      success: true,
      data: {
        metal,
        purity,
        weightGrams,
        pricePerGram: round(pricePerGram),
        metalValue: round(metalValue),
        making: round(making),
        taxPercent,
        tax: round(tax),
        subtotal: round(subtotal),
        total: round(total),
        lastUpdated: metalDoc.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error in compute-price:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to compute price', 
      message: error.message 
    });
  }
});

module.exports = router;