import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { apiUrl } from "@/shared/lib/api";
import { Cart, CartItem } from "@/shared/types";
import { useAuth } from "@/shared/contexts/auth";

export const useCart = () => {
  const { toast } = useToast();
  const { user, isLoggedIn } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get auth token
  const getToken = () => localStorage.getItem('token');
  
  // Check if user is admin - admins don't have carts
  const isAdmin = user?.role === 'admin';
  
  // Additional safety check - don't make any cart calls if user is admin
  const shouldSkipCartCalls = !isLoggedIn || isAdmin || !user;

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    const token = getToken();
    
    // Debug logging
    console.log('useCart - fetchCart called:', { token: !!token, isAdmin, user });
    
    if (!token || isAdmin) {
      console.log('useCart - Skipping cart fetch for admin or unauthenticated user');
      return; // Don't fetch cart for admin users
    }

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
  }, [isAdmin, user]);

  // Get cart item count (for header badge)
  const getCartCount = useCallback(async () => {
    const token = getToken();
    if (!token || isAdmin) return 0; // Don't fetch cart count for admin users

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
  }, [isAdmin]);

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

    if (isAdmin) {
      toast({
        title: "Action Not Available",
        description: "Admin users cannot add items to cart.",
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
  }, [toast, isAdmin]);

  // Update cart item quantity
  const updateCartItem = useCallback(async (productId: string, variantId: string, quantity: number) => {
    const token = getToken();
    if (!token || isAdmin) return false;

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
  }, [toast, isAdmin]);

  // Clear cart
  const clearCart = useCallback(async () => {
    const token = getToken();
    if (!token || isAdmin) return false;

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
  }, [toast, isAdmin]);

  // Get cart count from local state - return 0 for admin users
  const cartCount = isAdmin ? 0 : (cart?.totalItems || 0);

  // Load cart on mount - only when user data is available
  useEffect(() => {
    // Only fetch cart when we have user data and user is not admin
    if (user && !isAdmin) {
      console.log('useCart - useEffect triggering fetchCart for non-admin user');
      fetchCart();
    } else {
      console.log('useCart - useEffect skipping fetchCart:', { user: !!user, isAdmin });
    }
  }, [fetchCart, user, isAdmin]);

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