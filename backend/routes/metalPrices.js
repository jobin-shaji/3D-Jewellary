const express = require('express');
const router = express.Router();

// Cache for metal prices (to avoid regenerating too frequently)
let priceCache = {};
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Comprehensive mock metal prices data with type and purity
const getComprehensiveMetalPrices = () => {
  const baseDate = new Date();
  const randomVariation = () => (Math.random() - 0.5) * 2; // Random change between -1% and +1%
  
  return {
    Gold: {
      '24k': {
        name: 'Gold 24k',
        type: 'Gold',
        purity: '24k',
        purityPercentage: 99.9,
        pricePerGram: 7425.50 + (Math.random() * 100 - 50), // INR per gram
        change: randomVariation(),
        lastUpdated: baseDate.toISOString(),
        source: 'mock'
      },
      '22k': {
        name: 'Gold 22k',
        type: 'Gold',
        purity: '22k',
        purityPercentage: 91.7,
        pricePerGram: 6750.85 + (Math.random() * 100 - 50),
        change: randomVariation(),
        lastUpdated: baseDate.toISOString(),
        source: 'mock'
      },
      '18k': {
        name: 'Gold 18k',
        type: 'Gold',
        purity: '18k',
        purityPercentage: 75.0,
        pricePerGram: 5565.12 + (Math.random() * 100 - 50),
        change: randomVariation(),
        lastUpdated: baseDate.toISOString(),
        source: 'mock'
      },
      '14k': {
        name: 'Gold 14k',
        type: 'Gold',
        purity: '14k',
        purityPercentage: 58.3,
        pricePerGram: 4365.20 + (Math.random() * 100 - 50),
        change: randomVariation(),
        lastUpdated: baseDate.toISOString(),
        source: 'mock'
      },
      '10k': {
        name: 'Gold 10k',
        type: 'Gold',
        purity: '10k',
        purityPercentage: 41.7,
        pricePerGram: 3160.30 + (Math.random() * 50 - 25),
        change: randomVariation(),
        lastUpdated: baseDate.toISOString(),
        source: 'mock'
      }
    },
    Silver: {
      'Fine': {
        name: 'Fine Silver',
        type: 'Silver',
        purity: 'Fine',
        purityPercentage: 99.9,
        pricePerGram: 84.78 + (Math.random() * 3 - 1.5),
        change: randomVariation(),
        lastUpdated: baseDate.toISOString(),
        source: 'mock'
      },
      'Sterling': {
        name: 'Sterling Silver',
        type: 'Silver',
        purity: 'Sterling',
        purityPercentage: 92.5,
        pricePerGram: 78.42 + (Math.random() * 3 - 1.5),
        change: randomVariation(),
        lastUpdated: baseDate.toISOString(),
        source: 'mock'
      },
      'Coin': {
        name: 'Coin Silver',
        type: 'Silver',
        purity: 'Coin',
        purityPercentage: 90.0,
        pricePerGram: 76.20 + (Math.random() * 3 - 1.5),
        change: randomVariation(),
        lastUpdated: baseDate.toISOString(),
        source: 'mock'
      },
      'Britannia': {
        name: 'Britannia Silver',
        type: 'Silver',
        purity: 'Britannia',
        purityPercentage: 95.8,
        pricePerGram: 81.05 + (Math.random() * 3 - 1.5),
        change: randomVariation(),
        lastUpdated: baseDate.toISOString(),
        source: 'mock'
      }
    },
    Platinum: {
      '950': {
        name: 'Platinum 950',
        type: 'Platinum',
        purity: '950',
        purityPercentage: 95.0,
        pricePerGram: 3055.85 + (Math.random() * 100 - 50),
        change: randomVariation(),
        lastUpdated: baseDate.toISOString(),
        source: 'mock'
      },
      '900': {
        name: 'Platinum 900',
        type: 'Platinum',
        purity: '900',
        purityPercentage: 90.0,
        pricePerGram: 2907.30 + (Math.random() * 100 - 50),
        change: randomVariation(),
        lastUpdated: baseDate.toISOString(),
        source: 'mock'
      },
      '850': {
        name: 'Platinum 850',
        type: 'Platinum',
        purity: '850',
        purityPercentage: 85.0,
        pricePerGram: 2746.72 + (Math.random() * 100 - 50),
        change: randomVariation(),
        lastUpdated: baseDate.toISOString(),
        source: 'mock'
      }
    }
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
    const now = Date.now();
    
    // Check if we should use cached data
    const cacheKey = type && purity ? `${type}_${purity}` : 'all';
    const shouldUseCache = lastFetch && (now - lastFetch) < CACHE_DURATION && priceCache[cacheKey];
    
    if (shouldUseCache) {
      return res.json({
        success: true,
        data: priceCache[cacheKey],
        cached: true,
        lastUpdated: new Date(lastFetch).toISOString()
      });
    }

    // Get fresh data
    const allPrices = getComprehensiveMetalPrices();
    let responseData;

    if (type && purity) {
      // Get specific metal with specific purity
      if (allPrices[type] && allPrices[type][purity]) {
        responseData = allPrices[type][purity];
      } else {
        return res.status(404).json({
          success: false,
          error: `Metal price not found for ${type} ${purity}`,
          availableTypes: Object.keys(allPrices),
          availablePurities: type && allPrices[type] ? Object.keys(allPrices[type]) : []
        });
      }
    } else if (type) {
      // Get all purities for a specific metal type
      if (allPrices[type]) {
        responseData = Object.values(allPrices[type]);
      } else {
        return res.status(404).json({
          success: false,
          error: `Metal type '${type}' not found`,
          availableTypes: Object.keys(allPrices)
        });
      }
    } else {
      // Get all metals and all purities (flattened)
      responseData = [];
      Object.values(allPrices).forEach(metalType => {
        responseData = responseData.concat(Object.values(metalType));
      });
    }

    // Update cache
    priceCache[cacheKey] = responseData;
    lastFetch = now;

    res.json({
      success: true,
      data: responseData,
      cached: false,
      lastUpdated: new Date().toISOString(),
      dataSource: 'mock',
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
    const allPrices = getComprehensiveMetalPrices();
    
    const availableOptions = Object.keys(allPrices).map(type => ({
      type,
      purities: Object.keys(allPrices[type])
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

/**
 * Get specific metal price by type and purity (legacy endpoint)
 * @deprecated Use /prices?type=X&purity=Y instead
 */
router.get('/prices/:type/:purity', async (req, res) => {
  try {
    const { type, purity } = req.params;
    
    const allPrices = getComprehensiveMetalPrices();
    
    if (allPrices[type] && allPrices[type][purity]) {
      const priceData = allPrices[type][purity];
      
      res.json({
        success: true,
        data: priceData,
        cached: false,
        lastUpdated: new Date().toISOString(),
        dataSource: 'mock'
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Metal price for ${type} ${purity} not found`,
        availableTypes: Object.keys(allPrices),
        availablePurities: allPrices[type] ? Object.keys(allPrices[type]) : []
      });
    }

  } catch (error) {
    console.error(`Error fetching price for ${req.params.type} ${req.params.purity}:`, error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metal price',
      message: error.message
    });
  }
});

module.exports = router;