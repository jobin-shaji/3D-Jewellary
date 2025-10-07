const express = require('express');
const Metal = require('../models/metal');
const router = express.Router();

// Purity data and helper functions
const purityData = {
  map: {
    Gold: {
      '24k': 99.9,
      '22k': 91.7,
      '18k': 75.0,
      '14k': 58.3,
      '10k': 41.7
    },
    Silver: {
      'Fine': 99.9,
      'Sterling': 92.5,
      'Coin': 90.0,
      'Britannia': 95.8
    },
    Platinum: {
      '950': 95.0,
      '900': 90.0,
      '850': 85.0
    },
    Palladium: {
      '950': 95.0,
      '900': 90.0,
      '850': 85.0
    }
  },
  get: (metal, purity) => purityData.map[metal]?.[purity] || 0,
  getPurities: (metal) => Object.keys(purityData.map[metal] || {})
};

// Helper function to get purity percentage based on metal type and purity
const getPurityPercentage = purityData.get;

// Helper function to format metal data to match frontend expectations
const formatMetalData = (metalDoc) => {
  return {
    name: `${metalDoc.metal} ${metalDoc.purity}`,
    type: metalDoc.metal,
    purity: metalDoc.purity,
    purityPercentage: getPurityPercentage(metalDoc.metal, metalDoc.purity),
    pricePerGram: metalDoc.pricePerGram,
    change: metalDoc.change,
    absoluteChange: metalDoc.absoluteChange,
    lastUpdated: metalDoc.updatedAt.toISOString(),
    source: metalDoc.source
  };
};

// Function to update metal prices from API
async function updateMetalPricesFromAPI() {
  const apiKey = process.env.metalprice_api_key2;
  const url = `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=INR&currencies=XAU,XAG,XPT,XPD`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log('API Response:', JSON.stringify(data, null, 2));

    if (!data.success) {
      throw new Error('API request failed');
    }

    const rates = data.rates;
    const ounceToGram = 31.1035; // 1 troy ounce = 31.1035 grams

    const metalMap = {
      XAU: 'Gold',
      XAG: 'Silver',
      XPT: 'Platinum',
      XPD: 'Palladium'
    };

    for (const symbol in metalMap) {
      const metal = metalMap[symbol];
      // The API provides both direct rates (XAU) and INR rates (INRXAU)
      // Use the INR rates directly as they give price per troy ounce in INR
      const inrSymbol = `INR${symbol}`;
      const pricePerOunce = rates[inrSymbol];
      
      if (!pricePerOunce) {
        console.log(`No price found for ${metal} (${inrSymbol})`);
        continue;
      }
      
      const pricePerGram = pricePerOunce / ounceToGram;

      // Get all purities for this metal
      const purities = purityData.getPurities(metal);

      for (const purity of purities) {
        const purityPercentage = getPurityPercentage(metal, purity);
        const adjustedPricePerGram = pricePerGram * (purityPercentage / 100);

        // Find existing entry to calculate change
        const existing = await Metal.findOne({ metal, purity });
        let change = 0;
        let absoluteChange = 0;

        if (existing) {
          change = ((adjustedPricePerGram - existing.pricePerGram) / existing.pricePerGram) * 100;
          absoluteChange = adjustedPricePerGram - existing.pricePerGram;
        }

        // Only update if there's a price change or it's a new entry
        if (!existing || absoluteChange !== 0) {
          await Metal.findOneAndUpdate(
            { metal, purity },
            {
              pricePerGram: adjustedPricePerGram,
              change,
              absoluteChange,
              source: 'api',
              updatedAt: new Date()
            },
            { upsert: true, new: true }
          );
        }
      }
    }

    console.log('Metal prices updated successfully');
  } catch (error) {
    console.error('Error updating metal prices from API:', error);
  }
}

/**
 * Get metal prices - supports filtering by type and purity
 * Query parameters:
 * - type: metal type (Gold, Silver, Platinum)
 * - purity: purity level (24k, 18k, Sterling, 950, etc.)
 */
router.get('/prices', async (req, res) => {
  try {
    const { type, purity } = req.query;

    // Log the incoming request for debugging
    console.log('Metal prices request:', { type, purity });

    // Check if prices need updating (older than 4 days)
    const latestMetal = await Metal.findOne().sort({ updatedAt: -1 });
    const fourDaysInMs = 4 * 24 * 60 * 60 * 1000;
    if (!latestMetal || (new Date() - latestMetal.updatedAt) >= fourDaysInMs) {
      console.log('Metal prices are stale, updating from API...');
      await updateMetalPricesFromAPI();
    }

    // Build query filter
    const filter = {};
    if (type) {
      filter.metal = type;
    }
    if (purity) {
      filter.purity = purity;
    }

    // Fetch metals from database
    const metals = await Metal.find(filter).sort({ updatedAt: -1 });

    if (metals.length === 0) {
      const availableMetals = await Metal.distinct('metal');
      const availablePurities = type ?
        await Metal.distinct('purity', { metal: type }) :
        await Metal.distinct('purity');

      console.log('No metals found for filter:', filter, 'Available:', { availableMetals, availablePurities });

      return res.status(404).json({
        success: false,
        error: type && purity ?
          `Metal price not found for ${type} ${purity}` :
          type ? `No metals found for type '${type}'` : 'No metal prices found',
        availableTypes: availableMetals,
        availablePurities: availablePurities,
        requestedFilter: filter
      });
    }

    // Format data for frontend
    const responseData = metals.map(formatMetalData);

    // If specific metal and purity requested, return single object
    const finalData = (type && purity && responseData.length === 1) ?
      responseData[0] : responseData;

    res.json({
      success: true,
      data: finalData,
      cached: false,
      lastUpdated: new Date().toISOString(),
      dataSource: 'database',
      filters: { type, purity }
    });

  } catch (error) {
    console.error('Error in metal prices endpoint:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch metal prices',
      message: error.message
    });
  }
});

/**
 * Get available metal types and purities
 */
router.get('/types', async (req, res) => {
  try {
    // Get all distinct metal types and their purities
    const metals = await Metal.find({}, 'metal purity').sort({ metal: 1, purity: 1 });

    // Group by metal type
    const groupedMetals = metals.reduce((acc, metal) => {
      if (!acc[metal.metal]) {
        acc[metal.metal] = [];
      }
      if (!acc[metal.metal].includes(metal.purity)) {
        acc[metal.metal].push(metal.purity);
      }
      return acc;
    }, {});

    // Convert to array format expected by frontend
    const availableOptions = Object.keys(groupedMetals).map(type => ({
      type,
      purities: groupedMetals[type]
    }));

    res.json({
      success: true,
      data: availableOptions,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching metal types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metal types',
      message: error.message
    });
  }
});

module.exports = router;
module.exports.updateMetalPricesFromAPI = updateMetalPricesFromAPI;