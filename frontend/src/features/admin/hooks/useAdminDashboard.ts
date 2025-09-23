import { useState, useEffect } from 'react';


interface Order {
  id: string;
  customer: string;
  total: number;
  status: string;
  date: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  registrationDate: string;
}

interface AnalyticsData {
  totalRevenue: number;
  monthlyGrowth: number;
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
}

export const useAdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRevenue: 0,
    monthlyGrowth: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API calls
      // For now, using mock data

      // Mock orders
      const mockOrders: Order[] = [
        { id: "ORD-001", customer: "John Doe", total: 2500, status: "completed", date: "2024-01-15T10:30:00Z" },
        { id: "ORD-002", customer: "Jane Smith", total: 1800, status: "processing", date: "2024-01-15T09:15:00Z" },
        { id: "ORD-003", customer: "Mike Johnson", total: 3200, status: "shipped", date: "2024-01-14T16:45:00Z" },
        { id: "ORD-004", customer: "Sarah Wilson", total: 950, status: "completed", date: "2024-01-14T14:20:00Z" },
        { id: "ORD-005", customer: "David Brown", total: 4100, status: "processing", date: "2024-01-13T11:10:00Z" }
      ];

      // Mock users
      const mockUsers: User[] = [
        { id: "USR-001", name: "Alice Johnson", email: "alice@email.com", role: "customer", status: "active", registrationDate: "2024-01-10T08:00:00Z" },
        { id: "USR-002", name: "Bob Smith", email: "bob@email.com", role: "customer", status: "active", registrationDate: "2024-01-09T10:30:00Z" },
        { id: "USR-003", name: "Charlie Brown", email: "charlie@email.com", role: "admin", status: "active", registrationDate: "2024-01-08T14:15:00Z" },
        { id: "USR-004", name: "Diana Wilson", email: "diana@email.com", role: "customer", status: "inactive", registrationDate: "2024-01-07T09:45:00Z" },
        { id: "USR-005", name: "Eva Davis", email: "eva@email.com", role: "customer", status: "active", registrationDate: "2024-01-06T16:20:00Z" }
      ];

      // Mock analytics
      const mockAnalytics: AnalyticsData = {
        totalRevenue: 125000,
        monthlyGrowth: 12.5,
        totalUsers: 1250,
        totalOrders: 450,
        totalProducts: 85,
        averageOrderValue: 278
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setOrders(mockOrders);
      setUsers(mockUsers);
      setAnalyticsData(mockAnalytics);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refreshData = () => {
    fetchDashboardData();
  };

  // Get recent orders (last 5)
  const getRecentOrders = () => {
    return orders
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  // Get order statistics
  const getOrderStats = () => {
    const completed = orders.filter(order => order.status === 'completed').length;
    const processing = orders.filter(order => order.status === 'processing').length;
    const shipped = orders.filter(order => order.status === 'shipped').length;
    
    return { completed, processing, shipped, total: orders.length };
  };

  // Get user statistics
  const getUserStats = () => {
    const active = users.filter(user => user.status === 'active').length;
    const inactive = users.filter(user => user.status === 'inactive').length;
    const admins = users.filter(user => user.role === 'admin').length;
    
    return { active, inactive, admins, total: users.length };
  };

  return {
    orders,
    users,
    analyticsData,
    loading,
    error,
    refreshData,
    getRecentOrders,
    getOrderStats,
    getUserStats
  };
};