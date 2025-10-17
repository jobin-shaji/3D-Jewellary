import { useState, useEffect, useCallback } from "react";
import { apiUrl } from "@/shared/lib/api";
import { useToast } from "@/shared/hooks/use-toast";
import { useAuth } from "@/shared/contexts/auth";
import { Product } from "@/shared/types";

interface WishlistItem {
  productId: string;
  addedAt: string;
  product: Product;
}

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();

  // Fetch wishlist from backend
  const fetchWishlist = useCallback(async () => {
    if (!isLoggedIn) {
      setWishlist([]);
      setWishlistProductIds([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(apiUrl("/api/wishlist"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch wishlist");
      }

      setWishlist(data.wishlist || []);
      setWishlistProductIds(
        (data.wishlist || []).map((item: WishlistItem) => item.productId)
      );
    } catch (err: any) {
      console.error("Error fetching wishlist:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Add product to wishlist
  const addToWishlist = async (productId: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please login to add items to your wishlist.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(apiUrl("/api/wishlist"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add to wishlist");
      }

      toast({
        title: "Added to Wishlist",
        description: "Product has been added to your wishlist.",
      });

      // Refresh wishlist
      await fetchWishlist();
      
      // Trigger global wishlist count refresh
      if ((window as any).refreshWishlistCount) {
        (window as any).refreshWishlistCount();
      }
      
      return true;
    } catch (err: any) {
      console.error("Error adding to wishlist:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to add to wishlist.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(apiUrl("/api/wishlist"), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove from wishlist");
      }

      toast({
        title: "Removed from Wishlist",
        description: "Product has been removed from your wishlist.",
      });

      // Refresh wishlist
      await fetchWishlist();
      
      // Trigger global wishlist count refresh
      if ((window as any).refreshWishlistCount) {
        (window as any).refreshWishlistCount();
      }
      
      return true;
    } catch (err: any) {
      console.error("Error removing from wishlist:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to remove from wishlist.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Toggle product in wishlist
  const toggleWishlist = async (productId: string) => {
    if (wishlistProductIds.includes(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(apiUrl("/api/wishlist/clear"), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to clear wishlist");
      }

      toast({
        title: "Wishlist Cleared",
        description: "All items have been removed from your wishlist.",
      });

      // Refresh wishlist
      await fetchWishlist();
      
      // Trigger global wishlist count refresh
      if ((window as any).refreshWishlistCount) {
        (window as any).refreshWishlistCount();
      }
      
      return true;
    } catch (err: any) {
      console.error("Error clearing wishlist:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to clear wishlist.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId: string) => {
    return wishlistProductIds.includes(productId);
  };

  // Fetch wishlist on mount and when login status changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    wishlist,
    wishlistProductIds,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isInWishlist,
    fetchWishlist,
  };
};
