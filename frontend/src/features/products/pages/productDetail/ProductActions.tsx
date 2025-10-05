import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Heart, ShoppingCart, Share2, Edit } from "lucide-react";
import { Product } from "@/shared/types";
import { useToast } from "@/shared/hooks/use-toast";

interface ProductActionsProps {
  product: Product;
  isAdmin: boolean;
  isWishlisted: boolean;
  onWishlistToggle: () => void;
  onAddToCart: () => void;
  onShare: () => void;
}

export const ProductActions = ({ 
  product, 
  isAdmin, 
  isWishlisted, 
  onWishlistToggle, 
  onAddToCart,
  onShare 
}: ProductActionsProps) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCartWithQuantity = () => {
    onAddToCart();
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector - Hidden for Admins */}
      {!isAdmin && product.stock_quantity > 0 && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Quantity:</label>
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
              disabled={quantity >= product.stock_quantity}
            >
              +
            </Button>
          </div>
          <span className="text-sm text-muted-foreground">
            ({product.stock_quantity} available)
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {/* Add to Cart Button - Hidden for Admins */}
        {!isAdmin && (
          <Button 
            className="flex-1" 
            onClick={handleAddToCartWithQuantity}
            disabled={product.stock_quantity === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stock_quantity > 0 ? "Add to Cart" : "Out of Stock"}
          </Button>
        )}

        {/* Admin-specific content */}
        {isAdmin && (
          <Button 
            onClick={() => navigate(`/admin/products/edit/${product.id}`)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </Button>
        )}

        {/* Wishlist and Share buttons - Available for all users */}
        <Button
          variant={isWishlisted ? "default" : "outline"}
          size="icon"
          onClick={onWishlistToggle}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onShare}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};