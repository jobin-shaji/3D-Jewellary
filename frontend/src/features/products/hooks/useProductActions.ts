import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Product, ProductVariant } from "@/shared/types";
import { useToast } from "@/shared/hooks/use-toast";
import { apiUrl } from "@/shared/lib/api";

export const useProductActions = (product: Product | null, selectedVariant?: ProductVariant | null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to add items to cart.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Determine variant_id: use selectedVariant's id, or product.id for non-variant products
      const variantId = selectedVariant?.variant_id || product.id;

  const response = await fetch(apiUrl('/api/cart/add'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          variant_id: variantId,
          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add item to cart');
      }

      console.log("✅ Added to cart:", data);
      
      toast({
        title: "Added to Cart",
        description: `${quantity} x ${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ''} has been added to your cart.`,
      });

      // Refresh cart count in header
      if ((window as any).refreshCartCount) {
        (window as any).refreshCartCount();
      }

      // Optional: navigate to cart or keep on page
      // navigate("/cart");

    } catch (error: any) {
      console.error('❌ Error adding to cart:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    setIsWishlisted(!isWishlisted);
    console.log(isWishlisted ? "Removed from wishlist" : "Added to wishlist", product.id);
    toast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      description: `${product.name} has been ${isWishlisted ? 'removed from' : 'added to'} your wishlist.`,
    });
  };

  const handleShare = () => {
    if (!product) return;
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Product link copied to clipboard.",
      });
    }
  };

  return {
    isWishlisted,
    quantity,
    setQuantity,
    handleAddToCart,
    handleWishlistToggle,
    handleShare,
    isAddingToCart,
  };
};