import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { apiUrl } from "@/shared/lib/api";

export interface CartItem {
  productId: string;
  variant_id: string;
  name: string;
  totalprice: number;
  quantity: number;
  image?: {
    image_url: string;
    alt_text: string;
  } | null;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  summary: {
    totalItems: number;
    totalAmount: number;
    itemCount: number;
  };
}

export const useCart = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get auth token
  const getToken = () => localStorage.getItem('token');

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
  const response = await fetch(apiUrl('/api/cart'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch cart');
      }

      setCart(data.cart);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get cart item count (for header badge)
  const getCartCount = useCallback(async () => {
    const token = getToken();
    if (!token) return 0;

    try {
  const response = await fetch(apiUrl('/api/cart/count'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get cart count');
      }

      return data.count || 0;
    } catch (err: any) {
      console.error('Error getting cart count:', err);
      return 0;
    }
  }, []);

  // Add item to cart
  const addToCart = useCallback(async (productId: string, variantId: string, quantity: number = 1) => {
    const token = getToken();
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to add items to cart.",
        variant: "destructive",
      });
      return false;
    }

    try {
  const response = await fetch(apiUrl('/api/cart/add'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          variant_id: variantId,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add item to cart');
      }

      // Update local cart state
      setCart(data.cart);

      return true;
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to add item to cart.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  // Update cart item quantity
  const updateCartItem = useCallback(async (productId: string, variantId: string, quantity: number) => {
    const token = getToken();
    if (!token) return false;

    try {
  const response = await fetch(apiUrl('/api/cart/update'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          variant_id: variantId,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update cart item');
      }

      // Update local cart state
      setCart(data.cart);

      return true;
    } catch (err: any) {
      console.error('Error updating cart item:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update cart item.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  // Clear cart
  const clearCart = useCallback(async () => {
    const token = getToken();
    if (!token) return false;

    try {
  const response = await fetch(apiUrl('/api/cart/clear'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to clear cart');
      }

      // Update local cart state
      setCart(data.cart);

      return true;
    } catch (err: any) {
      console.error('Error clearing cart:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to clear cart.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  // Get cart count from local state
  const cartCount = cart?.summary?.itemCount || 0;

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    cart,
    cartCount,
    loading,
    error,
    fetchCart,
    getCartCount,
    addToCart,
    updateCartItem,
    clearCart,
  };
};