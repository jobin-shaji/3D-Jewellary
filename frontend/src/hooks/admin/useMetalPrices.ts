import { useState, useEffect } from 'react';

interface MetalPrice {
  name: string;
  symbol: string;
  price: number;
  change: number;
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
        
        // TODO: Replace with actual API call to metal prices service
        // For now, using mock data
        const mockData: MetalPrice[] = [
          { name: "Gold", symbol: "AU", price: 2050.25, change: 1.2 },
          { name: "Silver", symbol: "AG", price: 24.85, change: -0.5 },
          { name: "Platinum", symbol: "PT", price: 995.50, change: 0.8 },
          { name: "Palladium", symbol: "PD", price: 1275.30, change: 2.1 }
        ];
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMetalPrices(mockData);
      } catch (err) {
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

  const refreshPrices = () => {
    setMetalPrices([]);
    setLoading(true);
    setError(null);
    
    // Trigger refetch
    setTimeout(() => {
      const mockData: MetalPrice[] = [
        { name: "Gold", symbol: "AU", price: 2050.25 + (Math.random() - 0.5) * 10, change: (Math.random() - 0.5) * 3 },
        { name: "Silver", symbol: "AG", price: 24.85 + (Math.random() - 0.5) * 1, change: (Math.random() - 0.5) * 2 },
        { name: "Platinum", symbol: "PT", price: 995.50 + (Math.random() - 0.5) * 20, change: (Math.random() - 0.5) * 2.5 },
        { name: "Palladium", symbol: "PD", price: 1275.30 + (Math.random() - 0.5) * 30, change: (Math.random() - 0.5) * 4 }
      ];
      setMetalPrices(mockData);
      setLoading(false);
    }, 500);
  };

  return {
    metalPrices,
    loading,
    error,
    refreshPrices
  };
};
