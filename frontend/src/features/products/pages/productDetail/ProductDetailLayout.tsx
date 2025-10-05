import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Product } from "@/shared/types";
import { useAuth } from "@/shared/contexts/auth";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductInfo } from "./ProductInfo";
import { ProductActions } from "./ProductActions";
import { PriceSummary } from "./PriceSummary";
import { ProductSpecifications } from "./ProductSpecifications";
import ProductCustomization from "./ProductCustomization";
import { useProductDetail } from "@/features/products/hooks/useProductDetail";
import { useProductActions } from "@/features/products/hooks/useProductActions";

export const ProductDetailLayout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { product, loading, error, calculatedPrice, selectedCustomizations, setSelectedCustomizations, handlePriceCalculated } = useProductDetail();
  const { isWishlisted, handleAddToCart, handleWishlistToggle, handleShare } = useProductActions(product);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-destructive mb-4">Error loading product: {error}</p>
              <Button onClick={() => navigate('/products')}>
                Back to Products
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading product details...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // No product found
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Product not found</p>
              <Button onClick={() => navigate('/products')}>
                Back to Products
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Product Images */}
          <ProductImageGallery product={product} />

          {/* Right Column - Product Details */}
          <div className="space-y-6">
            <ProductInfo 
              product={product} 
              calculatedPrice={calculatedPrice}
            />

            <ProductActions 
              product={product}
              isAdmin={isAdmin}
              isWishlisted={isWishlisted}
              onWishlistToggle={handleWishlistToggle}
              onAddToCart={handleAddToCart}
              onShare={handleShare}
            />

            <Separator />

            {/* Product Customization - Only show if product has customizations */}
            {product.variants && product.variants.length > 0 && (
              <>
                <ProductCustomization 
                  customizations={[]} // Will be replaced with actual customizations when implemented
                  onCustomizationChange={setSelectedCustomizations}
                />
                <Separator />
              </>
            )}

          </div>
        </div>

        {/* Product Specifications - Full Width Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-8">Product Specifications</h3>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Specifications Content - Left Side (2 columns) */}
            <div className="xl:col-span-2">
              <ProductSpecifications product={product} />
            </div>
            
            {/* Price Summary - Right Side (1 column) */}
            <div className="xl:col-span-1">
              <PriceSummary 
                product={product}
                onPriceCalculated={handlePriceCalculated}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};