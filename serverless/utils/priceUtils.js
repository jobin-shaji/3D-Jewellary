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


  // Helper to get latest metal price per gram from DB for given type & purity, returns both price and purity
  async function getMetalPriceDetail(metalType, purity) {
    if (!metalType) return { pricePerGram: 0 };
    try {
      const m = await Metal.findOne({ metal: metalType, purity }).lean();
      return { pricePerGram: m ? (m.pricePerGram || 0) : 0 };
    } catch (err) {
      return { pricePerGram: 0 };
    }
  }

  // Helper to build detailed metal breakdown
  const buildMetalDetails = async (metals) => {
    if (!Array.isArray(metals)) return [];
    const details = [];
    for (const metal of metals) {
      const type = metal.type || metal.Type;
      const purity = metal.purity;
      const weight = metal.weight || 0;
      const { pricePerGram } = await getMetalPriceDetail(type, purity);
      details.push({
        type,
        purity,
        weight,
        pricePerGram,
        totalPrice: weight * pricePerGram
      });
    }
    return details;
  };

  // Helper to build detailed gemstone breakdown
  const buildGemstoneDetails = (gemstones) => {
    if (!Array.isArray(gemstones)) return [];
    return gemstones.map(gem => ({
      type: gem.type,
      carat: gem.carat,
      count: gem.count,
      totalPrice: (gem.price || 0) * (gem.count || 0)
    }));
  };

  const results = [];

  // If product has variants, calculate price for each variant

  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    const gemstoneDetails = buildGemstoneDetails(product.gemstones);
    const gemstoneCosts = gemstoneDetails.reduce((sum, g) => sum + (g.totalPrice || 0), 0);

    for (const variant of product.variants) {
      const metalDetails = await buildMetalDetails(variant.metal);
      const metalCosts = metalDetails.reduce((sum, m) => sum + (m.totalPrice || 0), 0);
      const makingCharges = variant.making_price || 0;

      const subtotal = metalCosts + gemstoneCosts + makingCharges;
      const tax = subtotal * (taxPercent / 100);
      const total = subtotal + tax;

      results.push({
        variant_id: variant.variant_id,
        variant_name: variant.name,
        metals: metalDetails,
        gemstones: gemstoneDetails,
        makingCharges,
        subtotal,
        tax,
        total,
        roundedTotal: roundRupees(total),
      });
    }
  } else {
    // No variants - calculate for base product
    const metalDetails = await buildMetalDetails(product.metals);
    const metalCosts = metalDetails.reduce((sum, m) => sum + (m.totalPrice || 0), 0);
    const gemstoneDetails = buildGemstoneDetails(product.gemstones);
    const gemstoneCosts = gemstoneDetails.reduce((sum, g) => sum + (g.totalPrice || 0), 0);
    const makingCharges = product.makingPrice || 0;

    const subtotal = metalCosts + gemstoneCosts + makingCharges;
    const tax = subtotal * (taxPercent / 100);
    const total = subtotal + tax;

    results.push({
      variant_id: product.id, // Use product ID as variant ID for non-variant products
      variant_name: product.name,
      metals: metalDetails,
      gemstones: gemstoneDetails,
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

// async function computeVariantPrice(variant, options = {}) {
//   const taxPercent = typeof options.taxPercent === 'number' ? options.taxPercent : 3;

//   // Helper to get latest metal price per gram from DB for given type & purity.
//   async function getPricePerGram(metalType, purity) {
//     if (!metalType) return 0;
//     try {
//       const m = await Metal.findOne({ metal: metalType, purity }).lean();
//       return m ? (m.pricePerGram || 0) : 0;
//     } catch (err) {
//       return 0;
//     }
//   }

//   // Calculate metal costs for variant
//   let metalCosts = 0;
//   if (Array.isArray(variant.metal)) {
//     for (const metal of variant.metal) {
//       const weight = metal.weight || 0;
//       const pricePerGram = await getPricePerGram(metal.Type, metal.purity);
//       metalCosts += weight * pricePerGram;
//     }
//   }

//   const makingCharges = variant.making_price || 0;

//   const subtotal = metalCosts + makingCharges;
//   const tax = subtotal * (taxPercent / 100);
//   const total = subtotal + tax;

//   return {
//     success: true,
//     data: {
//       metalCosts,
//       makingCharges,
//       subtotal,
//       tax,
//       total,
//       roundedTotal: roundRupees(total),
//     },
//   };
// }


// module.exports = { computeProductPrice, computeVariantPrice };
module.exports = { computeProductPrice };
