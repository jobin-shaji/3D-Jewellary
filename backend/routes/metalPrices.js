const express = require('express');
const yahooFinance = require('yahoo-finance2');
const router = express.Router();

// Cache for metal prices (to avoid hitting API too frequently)
let priceCache = {};
let lastFetch = 0;
const CACHE_DURATION = 50 * 60 * 1000; // 50 minutes

// Mock metal prices as reliable fallback
const getMockMetalPrices = () => {
  const baseDate = new Date();
  const randomVariation = () => (Math.random() - 0.5) * 4; // Random change between -2% and +2%
  
  return [
    {
      name: 'Gold',
      symbol: 'AU',
      price: 11340.15 + (Math.random() * 20 - 10), // Base price with small random variation
      change: randomVariation(),
      ticker: 'GC=F',
      lastUpdated: baseDate.toISOString(),
      source: 'mock'
    },
    {
      name: 'Silver',
      symbol: 'AG',
      price: 24.85 + (Math.random() * 2 - 1),
      change: randomVariation(),
      ticker: 'SI=F',
      lastUpdated: baseDate.toISOString(),
      source: 'mock'
    },
    {
      name: 'Platinum',
      symbol: 'PT',
      price: 950.20 + (Math.random() * 20 - 10),
      change: randomVariation(),
      ticker: 'PL=F',
      lastUpdated: baseDate.toISOString(),
      source: 'mock'
    },
    {
      name: 'Palladium',
      symbol: 'PD',
      price: 1020.45 + (Math.random() * 30 - 15),
      change: randomVariation(),
      ticker: 'PA=F',
      lastUpdated: baseDate.toISOString(),
      source: 'mock'
    }
  ];
};

/**
 * Get real-time metal prices
 */
router.get('/prices', async (req, res) => {
  try {
    const now = Date.now();
    
    // Return cached data if recent
    if (lastFetch && (now - lastFetch) < CACHE_DURATION && Object.keys(priceCache).length > 0) {
      return res.json({
        success: true,
        data: Object.values(priceCache),
        cached: true,
        lastUpdated: new Date(lastFetch).toISOString()
      });
    }

    // Try to fetch real data from Yahoo Finance
    const symbols = {
      'GC=F': { name: 'Gold', symbol: 'AU' },        // Gold futures
      'SI=F': { name: 'Silver', symbol: 'AG' },      // Silver futures
      'PL=F': { name: 'Platinum', symbol: 'PT' },    // Platinum futures
      'PA=F': { name: 'Palladium', symbol: 'PD' }    // Palladium futures
    };

    let metalPrices = [];
    let useYahooFinance = true;

    try {
      // console.log('Attempting to fetch real metal prices from Yahoo Finance...');
      
      const promises = Object.entries(symbols).map(async ([ticker, info]) => {
        try {
          const quote = await yahooFinance.quote(ticker);
          const price = quote.regularMarketPrice || quote.previousClose || 0;
          const previousClose = quote.previousClose || price;
          const change = previousClose ? ((price - previousClose) / previousClose) * 100 : 0;

          return {
            name: info.name,
            symbol: info.symbol,
            price: price,
            change: change,
            ticker: ticker,
            lastUpdated: new Date().toISOString(),
            source: 'yahoo-finance'
          };
        } catch (error) {
          // console.error(`Error fetching ${info.name} price from Yahoo Finance:`, error.message);
          throw error; // Re-throw to trigger fallback for entire request
        }
      });

      metalPrices = await Promise.all(promises);
      // console.log('Successfully fetched real metal prices');
      
    } catch (error) {
      console.error('Yahoo Finance API failed, using mock data:', error.message);
      useYahooFinance = false;
      metalPrices = getMockMetalPrices();
    }

    // If Yahoo Finance failed entirely, use mock data
    if (!useYahooFinance || metalPrices.length === 0) {
      // console.log('Using mock metal prices as fallback');
      metalPrices = getMockMetalPrices();
    }

    // Update cache
    priceCache = {};
    metalPrices.forEach(price => {
      priceCache[price.symbol] = price;
    });
    lastFetch = now;

    res.json({
      success: true,
      data: metalPrices,
      cached: false,
      lastUpdated: new Date().toISOString(),
      dataSource: useYahooFinance ? 'yahoo-finance' : 'mock'
    });

  } catch (error) {
    // console.error('Error in metal prices endpoint, falling back to mock data:', error);
    
    // Final fallback - always return mock data if everything fails
    const mockPrices = getMockMetalPrices();
    
    res.json({
      success: true,
      data: mockPrices,
      cached: false,
      lastUpdated: new Date().toISOString(),
      dataSource: 'mock-fallback',
      error: 'Primary data source failed, using mock data'
    });
  }
});

/**
 * Get specific metal price
 */
router.get('/prices/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const symbolUpper = symbol.toUpperCase();
    
    // Check cache first
    if (priceCache[symbolUpper]) {
      return res.json({
        success: true,
        data: priceCache[symbolUpper],
        cached: true
      });
    }

    // If not in cache, try to fetch all prices
    try {
      const allPricesResponse = await fetch(`${req.protocol}://${req.get('host')}/api/metal-prices/prices`);
      const allPrices = await allPricesResponse.json();
      
      const requestedPrice = allPrices.data.find(price => price.symbol === symbolUpper);
      
      if (requestedPrice) {
        return res.json({
          success: true,
          data: requestedPrice,
          cached: false
        });
      }
    } catch (fetchError) {
      // console.error('Error fetching all prices, using mock data for single metal:', fetchError.message);
    }

    // Fallback to mock data for the specific metal
    const mockPrices = getMockMetalPrices();
    const mockPrice = mockPrices.find(price => price.symbol === symbolUpper);
    
    if (mockPrice) {
      res.json({
        success: true,
        data: mockPrice,
        cached: false,
        dataSource: 'mock-fallback'
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Metal price for symbol ${symbolUpper} not found`
      });
    }

  } catch (error) {
    // console.error(`Error fetching price for ${req.params.symbol}:`, error);
    
    // Final fallback - try to return mock data
    try {
      const mockPrices = getMockMetalPrices();
      const mockPrice = mockPrices.find(price => price.symbol === req.params.symbol.toUpperCase());
      
      if (mockPrice) {
        res.json({
          success: true,
          data: mockPrice,
          cached: false,
          dataSource: 'mock-emergency-fallback',
          error: 'Primary data source failed, using mock data'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to fetch metal price and no fallback available',
          message: error.message
        });
      }
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        error: 'Complete system failure',
        message: error.message
      });
    }
  }
});

module.exports = router;