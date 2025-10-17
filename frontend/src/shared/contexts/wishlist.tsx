import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '@/shared/contexts/auth';
import { apiUrl } from '@/shared/lib/api';

interface WishlistContextType {
  wishlistCount: number;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistCount, setWishlistCount] = useState(0);
  const { isLoggedIn, user } = useAuth();

  const refreshWishlist = useCallback(async () => {
    if (!isLoggedIn || user?.role === 'admin') {
      setWishlistCount(0);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(apiUrl('/api/wishlist'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setWishlistCount(data.wishlist?.length || 0);
      }
    } catch (err) {
      console.error('Error fetching wishlist count:', err);
    }
  }, [isLoggedIn, user]);

  // Fetch wishlist count on mount and when login status changes
  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  // Expose refreshWishlist globally for other components to trigger
  useEffect(() => {
    (window as any).refreshWishlistCount = refreshWishlist;
    return () => {
      delete (window as any).refreshWishlistCount;
    };
  }, [refreshWishlist]);

  return (
    <WishlistContext.Provider value={{ wishlistCount, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlistContext must be used within a WishlistProvider');
  }
  return context;
}
