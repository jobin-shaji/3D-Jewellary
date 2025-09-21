const express = require('express');
const yahooFinance = require('yahoo-finance2');
const router = express.Router();

// Cache for metal prices (to avoid hitting API too frequently)
let priceCache = {};
let lastFetch = 0;
const CACHE_DURATION = 50 * 60 * 1000; // 50 minutes

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

    // Fetch fresh data
    const symbols = {
      'GC=F': { name: 'Gold', symbol: 'AU' },        // Gold futures
      'SI=F': { name: 'Silver', symbol: 'AG' },      // Silver futures
      'PL=F': { name: 'Platinum', symbol: 'PT' },    // Platinum futures
      'PA=F': { name: 'Palladium', symbol: 'PD' }    // Palladium futures
    };

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
          lastUpdated: new Date().toISOString()
        };
      } catch (error) {
        console.error(`Error fetching ${info.name} price:`, error);
        // Return mock data on error
        return {
          name: info.name,
          symbol: info.symbol,
          price: info.name === 'Gold' ? 1140.05 : info.name === 'Silver' ? 24.85 : 1000,
          change: Math.random() * 4 - 2, // Random change between -2% and +2%
          ticker: ticker,
          lastUpdated: new Date().toISOString(),
          error: 'Failed to fetch real data, using fallback'
        };
      }
    });

    const metalPrices = await Promise.all(promises);
    
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
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching metal prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metal prices',
      message: error.message
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

    // If not in cache, fetch all prices and return the requested one
    const allPricesResponse = await fetch(`${req.protocol}://${req.get('host')}/api/metal-prices/prices`);
    const allPrices = await allPricesResponse.json();
    
    const requestedPrice = allPrices.data.find(price => price.symbol === symbolUpper);
    
    if (requestedPrice) {
      res.json({
        success: true,
        data: requestedPrice,
        cached: false
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Metal price for symbol ${symbolUpper} not found`
      });
    }

  } catch (error) {
    console.error(`Error fetching price for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metal price',
      message: error.message
    });
  }
});

module.exports = router;