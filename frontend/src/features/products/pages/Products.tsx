import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Heart, Loader2 } from "lucide-react";
import { Product3DViewer } from "@/features/products/components/Product3DViewer";
import { useProducts } from "@/features/products/hooks/useProducts";

const Products = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const [wishlistedItems, setWishlistedItems] = useState<string[]>([]);
  
  // Use the centralized products hook instead of duplicate logic
  const { products, loading, error } = useProducts();

  const filteredProducts = products.filter(product => {
    if (category && product.category?.name.toLowerCase() !== category.toLowerCase()) return false;
    if (search && !product.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getTitle = () => {
    if (search) return `Search results for "${search}"`;
    if (category) return category.charAt(0).toUpperCase() + category.slice(1);
    return "All Products";
  };

  const handleWishlistToggle = (productId: string) => {
    setWishlistedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center min-h-[400px] flex items-center justify-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Error Loading Products</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
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
        <h1 className="text-3xl font-bold mb-8">{getTitle()}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div 
                  className="relative overflow-hidden rounded-t-lg cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                >
                  {/* Display primary image or 3D model */}
                  {product.primaryImage ? (
                    <img
                      src={product.primaryImage.image_url}
                      alt={product.primaryImage.alt_text || product.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : product.model_3d_url ? (
                    <Product3DViewer
                      modelUrl={product.model_3d_url}
                      productName={product.name}
                      className="h-64"
                    />
                  ) : (
                    <div className="w-full h-64 bg-muted flex items-center justify-center">
                      <p className="text-muted-foreground">No image available</p>
                    </div>
                  )}
                  <Button
                    size="icon"
                    variant={wishlistedItems.includes(product.id) ? "default" : "ghost"}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlistToggle(product.id);
                    }}
                  >
                    <Heart className={`h-4 w-4 ${wishlistedItems.includes(product.id) ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4" onClick={() => handleProductClick(product.id)}>
                <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                <p className="text-muted-foreground text-sm mb-2">{product.description}</p>
                <Badge variant="secondary" className="mb-2">
                  {product.category?.name || 'No Category'}
                </Badge>
                <p className="text-2xl font-bold text-primary">₹{product.totalPrice}</p>
                {(() => {
                  // For products with variants, check if at least one variant has stock
                  if (product.variants && product.variants.length > 0) {
                    const hasStockInAnyVariant = product.variants.some(variant => variant.stock_quantity > 0);
                    if (!hasStockInAnyVariant) {
                      return <Badge variant="destructive" className="mt-2">Out of Stock</Badge>;
                    }
                  } else {
                    // For products without variants, check the main product stock
                    if (product.stock_quantity <= 0) {
                      return <Badge variant="destructive" className="mt-2">Out of Stock</Badge>;
                    }
                  }
                  return null;
                })()}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found</p>
          </div>
        )}
      </main>

    </div>
  );
};

export default Products;
