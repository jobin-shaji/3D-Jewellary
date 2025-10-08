import { useState, useEffect } from 'react';
import { apiUrl } from '@/shared/lib/api';

// Export the interface to reduce complexity and avoid duplication
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  activeProducts: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  recentOrders: Array<{
    orderId: string;
    userId: string;
    totalPrice: number;
    status: string;
    createdAt: string;
    shippingAddress: {
      name: string;
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
  }>;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    activeProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
  const response = await fetch(apiUrl('/api/admin/stats'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      
      // Fallback to mock data on error
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        activeProducts: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        recentOrders: []
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
    fetchStats();
  };

  return {
    stats,
    loading,
    error,
    refreshStats
  };
};