import { useState, useCallback } from 'react';
import { apiUrl } from '@/shared/lib/api';
import { useToast } from '@/shared/hooks/use-toast';

interface Order {
  orderId: string;
  userId: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  items: Array<{
    product: {
      id: string;
      name: string;
      description: string;
      category_id: number;
      makingPrice: number;
      metals: any[];
      gemstones: any[];
      images: any[];
      model_3d_url: string;
      certificates: any[];
      totalPrice: number;
    };
    variant: {
      variant_id: string;
      name: string;
      making_price: number;
      metal: any[];
      totalPrice: number;
    } | null;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  shippingFee: number;
  totalPrice: number;
  payment: {
    method: string;
    transactionId?: string;
    paymentStatus: string;
    paidAt?: string;
    refundAmount: number;
  };
  status: string;
  orderHistory: Array<{
    status: string;
    timestamp: string;
    updatedBy: string;
    notes?: string;
  }>;
  notes: {
    customerNotes?: string;
    adminNotes?: string;
    specialInstructions?: string;
  };
  createdAt: string;
  updatedAt: string;
}

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
   * Create a new order
   */
  const createOrder = useCallback(async (orderData: CreateOrderData) => {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(apiUrl('/api/orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }
      
      if (data.order) {
        toast({
          title: "Order Placed Successfully!",
          description: `Order ${data.order.orderId} has been created.`,
        });
        
        return data.order;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create order';
      setError(errorMessage);
      
      toast({
        title: "Order Failed",
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
    createOrder,
    fetchOrders,
    fetchOrderById,
    cancelOrder,
    clearCurrentOrder,
    clearError
  };
};

export default useOrders;