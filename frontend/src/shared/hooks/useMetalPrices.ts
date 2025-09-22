import { useState, useEffect } from 'react';

interface MetalPrice {
  name: string;
  type: string;
  purity: string;
  purityPercentage: number;
  pricePerGram: number;
  pricePerOunce: number;
  change: number;
  lastUpdated: string;
  source: string;
  error?: string;
}

interface MetalPriceFilters {
  type?: string;
  purity?: string;
}

interface AvailableMetalOption {
  type: string;
  purities: string[];
}

export const useMetalPrices = (filters?: MetalPriceFilters) => {
  const [metalPrices, setMetalPrices] = useState<MetalPrice[]>([]);
  const [availableOptions, setAvailableOptions] = useState<AvailableMetalOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetalPrices = async (currentFilters?: MetalPriceFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (currentFilters?.type) {
        queryParams.append('type', currentFilters.type);
      }
      if (currentFilters?.purity) {
        queryParams.append('purity', currentFilters.purity);
      }
      
      const queryString = queryParams.toString();
      const url = `http://localhost:3000/api/metal-prices/prices${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Ensure data is always an array
        const dataArray = Array.isArray(result.data) ? result.data : [result.data];
        setMetalPrices(dataArray);
      } else {
        throw new Error(result.error || 'Failed to fetch metal prices');
      }
      
    } catch (err) {
      console.error('Error fetching metal prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch metal prices');
      
      // Fallback to mock data if API fails
      const fallbackData: MetalPrice[] = [
        { 
          name: "Gold 24k", 
          type: "Gold",
          purity: "24k",
          purityPercentage: 99.9,
          pricePerGram: 65.50, 
          pricePerOunce: 2035.25,
          change: (Math.random() - 0.5) * 2,
          lastUpdated: new Date().toISOString(),
          source: "fallback",
          error: "Using fallback data"
        },
        { 
          name: "Silver Sterling", 
          type: "Silver",
          purity: "Sterling",
          purityPercentage: 92.5,
          pricePerGram: 0.72, 
          pricePerOunce: 22.43,
          change: (Math.random() - 0.5) * 2,
          lastUpdated: new Date().toISOString(),
          source: "fallback",
          error: "Using fallback data"
        },
        { 
          name: "Platinum 950", 
          type: "Platinum",
          purity: "950",
          purityPercentage: 95.0,
          pricePerGram: 30.85, 
          pricePerOunce: 959.12,
          change: (Math.random() - 0.5) * 2,
          lastUpdated: new Date().toISOString(),
          source: "fallback",
          error: "Using fallback data"
        }
      ];
      
      // Filter fallback data if filters are provided
      let filteredData = fallbackData;
      if (currentFilters?.type) {
        filteredData = filteredData.filter(price => price.type === currentFilters.type);
      }
      if (currentFilters?.purity) {
        filteredData = filteredData.filter(price => price.purity === currentFilters.purity);
      }
      
      setMetalPrices(filteredData);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableOptions = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/metal-prices/types');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAvailableOptions(result.data);
        }
      }
    } catch (err) {
      console.error('Error fetching available metal options:', err);
      // Fallback options
      setAvailableOptions([
        { type: 'Gold', purities: ['24k', '22k', '18k', '14k', '10k'] },
        { type: 'Silver', purities: ['Fine', 'Sterling', 'Coin', 'Britannia'] },
        { type: 'Platinum', purities: ['950', '900', '850'] }
      ]);
    }
  };

  useEffect(() => {
    fetchMetalPrices(filters);
    fetchAvailableOptions();
    
    // Refresh prices every 5 minutes
    const interval = setInterval(() => fetchMetalPrices(filters), 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [filters?.type, filters?.purity]);

  const refreshPrices = async (newFilters?: MetalPriceFilters) => {
    const filtersToUse = newFilters || filters;
    await fetchMetalPrices(filtersToUse);
  };

  const getPrice = (type: string, purity: string): MetalPrice | undefined => {
    return metalPrices.find(price => price.type === type && price.purity === purity);
  };

  const getPricesByType = (type: string): MetalPrice[] => {
    return metalPrices.filter(price => price.type === type);
  };

  return {
    metalPrices,
    availableOptions,
    loading,
    error,
    refreshPrices,
    getPrice,
    getPricesByType
  };
};