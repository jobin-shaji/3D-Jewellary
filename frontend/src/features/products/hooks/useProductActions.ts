import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "@/shared/types";
import { useToast } from "@/shared/hooks/use-toast";

export const useProductActions = (product: Product | null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!product) return;
    
    console.log("Adding to cart:", { product: product.id, quantity });
    toast({
      title: "Added to Cart",
      description: `${quantity} x ${product.name} has been added to your cart.`,
    });
    // navigate("/checkout"); // Uncomment if you want to redirect to checkout
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
  };
};