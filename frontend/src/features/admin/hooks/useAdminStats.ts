import { useState, useEffect } from 'react';

// Export the interface to reduce complexity and avoid duplication
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  activeProducts: number;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    activeProducts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      console.log('useAdminStats: Fetching stats from API...');
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3000/api/admin/stats');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('useAdminStats: Received stats data:', data);
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      
      // Fallback to mock data on error
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        activeProducts: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

//   useEffect(() => {
//     fetchStats();
//   },);

  const refreshStats = () => {
    console.log('useAdminStats: refreshStats called');
    fetchStats();
  };

  return {
    stats,
    loading,
    error,
    refreshStats
  };
};