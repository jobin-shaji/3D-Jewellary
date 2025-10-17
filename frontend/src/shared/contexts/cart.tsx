import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '@/shared/contexts/auth';
import { apiUrl } from '@/shared/lib/api';

interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const { isLoggedIn, user } = useAuth();

  const refreshCart = useCallback(async () => {
    if (!isLoggedIn || user?.role === 'admin') {
      setCartCount(0);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(apiUrl('/api/cart/count'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setCartCount(data.count || 0);
      }
    } catch (err) {
      console.error('Error fetching cart count:', err);
    }
  }, [isLoggedIn, user]);

  // Fetch cart count on mount and when login status changes
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Expose refreshCart globally for other components to trigger
  useEffect(() => {
    (window as any).refreshCartCount = refreshCart;
    return () => {
      delete (window as any).refreshCartCount;
    };
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
