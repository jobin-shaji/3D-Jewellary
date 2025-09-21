import { useState, useEffect } from 'react';

interface MetalPrice {
  name: string;
  symbol: string;
  price: number;
  change: number;
  ticker: string;
  lastUpdated: string;
  error?: string;
}

export const useMetalPrices = () => {
  const [metalPrices, setMetalPrices] = useState<MetalPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetalPrices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Call backend API for real-time metal prices
        const response = await fetch('http://localhost:3000/api/metal-prices/prices');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setMetalPrices(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch metal prices');
        }
        
      } catch (err) {
        console.error('Error fetching metal prices:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch metal prices');
        
      } finally {
        setLoading(false);
      }
    };

    fetchMetalPrices();
    
    // Refresh prices every 5 minutes
    const interval = setInterval(fetchMetalPrices, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshPrices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3000/api/metal-prices/prices');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setMetalPrices(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch metal prices');
      }
    } catch (err) {
      console.error('Error refreshing metal prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh metal prices');
      
      // Fallback to mock data with random variations
      const mockData: MetalPrice[] = [
        { 
          name: "Gold", 
          symbol: "AU", 
          price: 2050.25 + (Math.random() - 0.5) * 10, 
          change: (Math.random() - 0.5) * 3,
          ticker: "GC=F",
          lastUpdated: new Date().toISOString(),
          error: "Using fallback data"
        },
        { 
          name: "Silver", 
          symbol: "AG", 
          price: 24.85 + (Math.random() - 0.5) * 1, 
          change: (Math.random() - 0.5) * 2,
          ticker: "SI=F",
          lastUpdated: new Date().toISOString(),
          error: "Using fallback data"
        },
        { 
          name: "Platinum", 
          symbol: "PT", 
          price: 995.50 + (Math.random() - 0.5) * 20, 
          change: (Math.random() - 0.5) * 2.5,
          ticker: "PL=F",
          lastUpdated: new Date().toISOString(),
          error: "Using fallback data"
        },
        { 
          name: "Palladium", 
          symbol: "PD", 
          price: 1275.30 + (Math.random() - 0.5) * 30, 
          change: (Math.random() - 0.5) * 4,
          ticker: "PA=F",
          lastUpdated: new Date().toISOString(),
          error: "Using fallback data"
        }
      ];
      setMetalPrices(mockData);
    } finally {
      setLoading(false);
    }
  };

  return {
    metalPrices,
    loading,
    error,
    refreshPrices
  };
};