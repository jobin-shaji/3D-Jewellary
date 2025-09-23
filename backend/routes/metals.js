const express = require('express');
const Metal = require('../models/metal');
const router = express.Router();

// Helper function to get purity percentage based on metal type and purity
const getPurityPercentage = (metal, purity) => {
  const purityMap = {
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
    }
  };

  return purityMap[metal]?.[purity] || 0;
};

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