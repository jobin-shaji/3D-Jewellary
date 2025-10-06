const Metal = require('../models/metal');

// Convert a computed number to rounded integer rupees (same rounding used in frontend)
function roundRupees(value) {
  return Math.round(value);
}

// Compute product price using provided product object.
// Returns an array of pricing data - one element per variant, or one element for the base product if no variants
// Expects product to have:
// - metals: [{ type, purity, weight }] (for base product)
// - gemstones: [{ price, count }]
// - makingPrice: number (for base product)
// - variants: [{ variant_id, metal: [...], making_price }] (optional)
// - taxPercent: number (optional) - if not provided, defaults to 3
async function computeProductPrice(product, options = {}) {
  const taxPercent = typeof options.taxPercent === 'number' ? options.taxPercent : 3;

  // Helper to get latest metal price per gram from DB for given type & purity.
  async function getPricePerGram(metalType, purity) {
    if (!metalType) return 0;
    try {
      const m = await Metal.findOne({ metal: metalType, purity }).lean();
      return m ? (m.pricePerGram || 0) : 0;
    } catch (err) {
      return 0;
    }
  }

  // Helper to calculate gemstone costs (shared across variants)
  const calculateGemstoneCosts = () => {
    let gemstoneCosts = 0;
    if (Array.isArray(product.gemstones)) {
      for (const g of product.gemstones) {
        const price = g.price || 0;
        const count = g.count || 0;
        gemstoneCosts += price * count;
      }
    }
    return gemstoneCosts;
  };

  // Helper to calculate metal costs for given metals array
  const calculateMetalCosts = async (metals) => {
    let metalCosts = 0;
    if (Array.isArray(metals)) {
      for (const metal of metals) {
        const weight = metal.weight || 0;
        const pricePerGram = await getPricePerGram(metal.type || metal.Type, metal.purity);
        metalCosts += weight * pricePerGram;
      }
    }
    return metalCosts;
  };

  const results = [];

  // If product has variants, calculate price for each variant
  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    const gemstoneCosts = calculateGemstoneCosts();
    
    for (const variant of product.variants) {
      const metalCosts = await calculateMetalCosts(variant.metal);
      const makingCharges = variant.making_price || 0;
      
      const subtotal = metalCosts + gemstoneCosts + makingCharges;
      const tax = subtotal * (taxPercent / 100);
      const total = subtotal + tax;

      results.push({
        variant_id: variant.variant_id,
        variant_name: variant.name,
        metalCosts,
        gemstoneCosts,
        makingCharges,
        subtotal,
        tax,
        total,
        roundedTotal: roundRupees(total),
      });
    }
  } else {
    // No variants - calculate for base product
    const metalCosts = await calculateMetalCosts(product.metals);
    const gemstoneCosts = calculateGemstoneCosts();
    const makingCharges = product.makingPrice || 0;

    const subtotal = metalCosts + gemstoneCosts + makingCharges;
    const tax = subtotal * (taxPercent / 100);
    const total = subtotal + tax;

    results.push({
      variant_id: product.id, // Use product ID as variant ID for non-variant products
      variant_name: product.name,
      metalCosts,
      gemstoneCosts,
      makingCharges,
      subtotal,
      tax,
      total,
      roundedTotal: roundRupees(total),
    });
  }

  return {
    success: true,
    data: results,
  };
}

// Compute variant price using variant-specific metal and making price
// Expects variant to have:
// - metal: [{ Type, purity, weight }]
// - making_price: number
// - taxPercent: number (optional) - if not provided, defaults to 3
async function computeVariantPrice(variant, options = {}) {
  const taxPercent = typeof options.taxPercent === 'number' ? options.taxPercent : 3;

  // Helper to get latest metal price per gram from DB for given type & purity.
  async function getPricePerGram(metalType, purity) {
    if (!metalType) return 0;
    try {
      const m = await Metal.findOne({ metal: metalType, purity }).lean();
      return m ? (m.pricePerGram || 0) : 0;
    } catch (err) {
      return 0;
    }
  }

  // Calculate metal costs for variant
  let metalCosts = 0;
  if (Array.isArray(variant.metal)) {
    for (const metal of variant.metal) {
      const weight = metal.weight || 0;
      const pricePerGram = await getPricePerGram(metal.Type, metal.purity);
      metalCosts += weight * pricePerGram;
    }
  }

  const makingCharges = variant.making_price || 0;

  const subtotal = metalCosts + makingCharges;
  const tax = subtotal * (taxPercent / 100);
  const total = subtotal + tax;

  return {
    success: true,
    data: {
      metalCosts,
      makingCharges,
      subtotal,
      tax,
      total,
      roundedTotal: roundRupees(total),
    },
  };
}

module.exports = { computeProductPrice, computeVariantPrice };
