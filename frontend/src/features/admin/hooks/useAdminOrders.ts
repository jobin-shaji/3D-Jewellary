import { useState, useCallback } from 'react';
import { apiUrl } from '@/shared/lib/api';
import { useToast } from '@/shared/hooks/use-toast';
import { Order } from '@/shared/types';

interface AdminOrdersResponse {
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface UseAdminOrdersOptions {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get auth token
  const getToken = () => localStorage.getItem('token');

  /**
   * Fetch all orders (admin view)
   */
  const fetchOrders = useCallback(async (options: UseAdminOrdersOptions = {}) => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.status) params.append('status', options.status);
      if (options.userId) params.append('userId', options.userId);
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);

      const response = await fetch(apiUrl(`/api/admin/orders?${params.toString()}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }
      
      if (data.orders) {
        setOrders(data.orders);
        setPagination(data.pagination);
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch orders';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Fetch a specific order by order ID (admin view)
   */
  const fetchOrderById = useCallback(async (orderId: string) => {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(apiUrl(`/api/admin/orders/${orderId}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch order details');
      }
      
      if (data.order) {
        setCurrentOrder(data.order);
        return data.order;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch order details';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Update order status (admin functionality)
   */
  const updateOrderStatus = useCallback(async (orderId: string, newStatus: string, notes?: string) => {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(apiUrl(`/api/admin/orders/${orderId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          notes: notes || ''
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update order status');
      }
      
      // Update the current order if it matches
      if (currentOrder && currentOrder.orderId === orderId) {
        setCurrentOrder(data.order);
      }
      
      // Update the order in the orders list
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId ? data.order : order
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Order ${orderId} status updated to ${newStatus}`,
      });
      
      return data.order;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update order status';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentOrder, toast]);

  /**
   * Clear current order
   */
  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder(null);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    orders,
    currentOrder,
    loading,
    pagination,
    error,
    
    // Actions
    fetchOrders,
    fetchOrderById,
    updateOrderStatus,
    clearCurrentOrder,
    clearError
  };
};

export default useAdminOrders;