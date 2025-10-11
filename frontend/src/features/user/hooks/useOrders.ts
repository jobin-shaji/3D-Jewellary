import { useState, useCallback } from 'react';
import { apiUrl } from '@/shared/lib/api';
import { useToast } from '@/shared/hooks/use-toast';
import { Order } from '@/shared/types';

interface CreateOrderData {
  address: any;
  paymentMethod: string;
  paymentDetails?: any;
  notes?: string;
  items: any[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface UseOrdersOptions {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useOrders = () => {
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
   * Create a payment order (Razorpay integration)
   */
  const createPaymentOrder = useCallback(async (orderData: CreateOrderData) => {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(apiUrl('/api/payments/create-order'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment order');
      }
      
      return data.order; // Returns { orderId, razorpayOrderId, amount, currency, etc. }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create payment order';
      setError(errorMessage);
      
      toast({
        title: "Order Creation Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Verify payment after successful Razorpay payment
   */
  const verifyPayment = useCallback(async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId: string;
  }) => {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(apiUrl('/api/payments/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment verification failed');
      }
      
      if (data.success) {
        toast({
          title: "Payment Successful!",
          description: `Order ${paymentData.orderId} has been placed successfully.`,
        });
        
        return data;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Payment verification failed';
      setError(errorMessage);
      
      toast({
        title: "Payment Verification Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  /**
   * Fetch user orders with pagination and filtering
   */
  const fetchOrders = useCallback(async (options: UseOrdersOptions = {}) => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.status) params.append('status', options.status);
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);

      const response = await fetch(apiUrl(`/api/orders?${params.toString()}`), {
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
   * Fetch a specific order by order ID
   */
  const fetchOrderById = useCallback(async (orderId: string) => {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(apiUrl(`/api/orders/${orderId}`), {
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
   * Cancel an order
   */
  const cancelOrder = useCallback(async (orderId: string, reason?: string) => {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(apiUrl(`/api/orders/${orderId}/cancel`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: reason || 'Cancelled by customer'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel order');
      }
      
      if (data.order) {
        toast({
          title: "Order Cancelled",
          description: `Order ${orderId} has been cancelled successfully.`,
        });
        
        // Update the current order if it's the same one
        if (currentOrder && currentOrder.orderId === orderId) {
          setCurrentOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
        }
        
        // Update orders list
        setOrders(prev => 
          prev.map(order => 
            order.orderId === orderId 
              ? { ...order, status: 'cancelled' }
              : order
          )
        );
        
        return data.order;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to cancel order';
      setError(errorMessage);
      
      toast({
        title: "Cancellation Failed",
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
    createPaymentOrder, // New Razorpay method
    verifyPayment, // New payment verification
    fetchOrders,
    fetchOrderById,
    cancelOrder,
    clearCurrentOrder,
    clearError
  };
};

export default useOrders;