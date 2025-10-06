import { Link } from "react-router-dom";
import { Badge } from "@/shared/components/ui/badge";
import { ChevronRight, Home } from "lucide-react";
import { Product, ProductVariant } from "@/shared/types";

interface ProductInfoProps {
  product: Product;
  calculatedPrice: number | null;
  selectedVariant?: ProductVariant | null;
}

export const ProductInfo = ({ product, calculatedPrice, selectedVariant }: ProductInfoProps) => {
  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/products" className="hover:text-foreground">
          Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        {product.category && (
          <>
            <Link to={`/products?category=${product.category.name.toLowerCase()}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      {/* Product Basic Info */}
      <div>
        {product.category && (
          <Badge variant="secondary" className="mb-2">
            {product.category.name}
          </Badge>
        )}
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-muted-foreground mb-4">{product.description}</p>
      </div>

      {/* Price and Stock Info */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-primary">
            ₹{calculatedPrice !== null ? calculatedPrice.toFixed(2) : "Calculating..."}
          </span>
        </div>
        <Badge variant={selectedVariant ? (selectedVariant.stock_quantity > 0 ? "secondary" : "destructive") : (product.stock_quantity > 0 ? "secondary" : "destructive")}>
          {selectedVariant ? (selectedVariant.stock_quantity > 0 ? `${selectedVariant.stock_quantity} in stock` : "Out of Stock") : (product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Out of Stock")}
        </Badge>
      </div>
    </div>
  );
};