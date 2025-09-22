import { useParams, useNavigate, Link } from "react-router-dom";

import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger } from "@/shared/components/ui/dialog";
import { 
  Heart, 
  ShoppingCart, 
  ArrowLeft, 
  Star, 
  Loader2, 
  ZoomIn, 
  Share2,
  ChevronRight,
  Home,
  Box,
  Edit
} from "lucide-react";
import { Product3DViewer } from "@/features/products/components/Product3DViewer";
import ProductCustomization from "@/features/products/pages/productDetail/ProductCustomization";
import { PriceSummary } from "./PriceSummary";
import { ProductSpecifications } from "./ProductSpecifications";
import { useState, useEffect } from "react";
import { Product } from "@/shared/types";
import { useToast } from "@/shared/hooks/use-toast";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useAuth } from "@/shared/contexts/auth";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { singleProduct: product, singleProductLoading: loading, singleProductError: error, fetchProduct } = useProducts();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string | number>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'3d' | 'image'>('3d'); // Track current view mode
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  
  // Only initialize quantity state for non-admin users
  const [quantity, setQuantity] = useState(1);

  // Fetch product data from backend
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        toast({
          title: "Error",
          description: "Product ID not found",
          variant: "destructive",
        });
        return;
      }

      try {
        const productData = await fetchProduct(id);
        
        // Set default customizations if available
        if (productData.customizations) {
          const defaults: Record<string, string | number> = {};
          productData.customizations.forEach((custom: any) => {
            if (custom.default_value !== undefined) {
              defaults[custom.id] = custom.default_value;
            }
          });
          setSelectedCustomizations(defaults);
        }

      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load product details. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadProduct();
  }, [id, fetchProduct, toast]);

  // Add to Cart functionality - Only for non-admin users
  const handleAddToCart = () => {
    if (!product || isAdmin) return;
    
    // Add to cart logic with customizations
    console.log("Added to cart:", product.id, "with customizations:", selectedCustomizations, "quantity:", quantity);
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
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
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

  const handlePriceCalculated = (totalPrice: number) => {
    setCalculatedPrice(totalPrice);
  };

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

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
  
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center min-h-[400px] flex items-center justify-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
              <p className="text-muted-foreground mb-6">{error || 'The product you are looking for does not exist.'}</p>
              <Button onClick={() => navigate('/products')}>
                Browse Products
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
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
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

        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images and 3D Viewer */}
          <div className="space-y-6">
            {/* Dynamic Layout based on customization availability */}
            {product.customizations && product.customizations.length > 0 ? (
              // Layout with customizations: Thumbnails below the main viewer
              <>
                {/* Main Display Area */}
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    {viewMode === '3d' ? (
                      // 3D Viewer Display
                      <Product3DViewer 
                        modelUrl={product.model_3d_url}
                        productName={product.name}
                        className="h-96 lg:h-[500px]"
                      />
                    ) : (
                      // Image Display with Zoom
                      product.images && product.images.length > 0 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="relative group cursor-pointer">
                              <img
                                src={product.images[selectedImageIndex]?.image_url}
                                alt={product.images[selectedImageIndex]?.alt_text || product.name}
                                className="w-full h-96 lg:h-[500px] object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <img
                              src={product.images[selectedImageIndex]?.image_url}
                              alt={product.images[selectedImageIndex]?.alt_text || product.name}
                              className="w-full h-auto"
                            />
                          </DialogContent>
                        </Dialog>
                      )
                    )}
                  </CardContent>
                </Card>
                
                {/* Thumbnail Navigation - Below the main viewer */}
                <div className="w-full border-t pt-4">
                  <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
                    {/* 3D Model Thumbnail */}
                    {product.model_3d_url && (
                      <div className="flex-shrink-0">
                        <Card 
                          className={`cursor-pointer hover:ring-2 hover:ring-primary transition-all border-2 ${
                            viewMode === '3d' ? 'ring-2 ring-primary bg-primary/5 border-primary' : 'border-transparent'
                          }`}
                          onClick={() => setViewMode('3d')}
                        >
                          <CardContent className="p-3 flex items-center justify-center w-20 h-20 bg-muted/30">
                            <Box className="h-6 w-6 text-primary" />
                          </CardContent>
                        </Card>
                        <p className="text-xs text-center mt-1 text-muted-foreground">3D Model</p>
                      </div>
                    )}
                    
                    {/* Image Thumbnails */}
                    {product.images && product.images.map((image, index) => (
                      <div key={image.id} className="flex-shrink-0">
                        <Card 
                          className={`cursor-pointer hover:ring-2 hover:ring-primary transition-all border-2 ${
                            viewMode === 'image' && selectedImageIndex === index ? 'ring-2 ring-primary bg-primary/5 border-primary' : 'border-transparent'
                          }`}
                          onClick={() => {
                            setViewMode('image');
                            setSelectedImageIndex(index);
                          }}
                        >
                          <CardContent className="p-1 w-20 h-20 flex items-center justify-center">
                            <img
                              src={image.image_url}
                              alt={image.alt_text || `${product.name} view ${index + 1}`}
                              className="w-16 h-16 object-cover rounded"
                            />
                          </CardContent>
                        </Card>
                        <p className="text-xs text-center mt-1 text-muted-foreground">Image {index + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              // Layout without customizations: Thumbnails to the left of the main viewer
              <div className="flex gap-4">
                {/* Thumbnail Navigation - Left side */}
                <div className="flex flex-col gap-3 flex-shrink-0">
                  {/* 3D Model Thumbnail */}
                  {product.model_3d_url && (
                    <div className="flex-shrink-0">
                      <Card 
                        className={`cursor-pointer hover:ring-2 hover:ring-primary transition-all border-2 ${
                          viewMode === '3d' ? 'ring-2 ring-primary bg-primary/5 border-primary' : 'border-transparent'
                        }`}
                        onClick={() => setViewMode('3d')}
                      >
                        <CardContent className="p-3 flex items-center justify-center w-20 h-20 bg-muted/30">
                          <Box className="h-6 w-6 text-primary" />
                        </CardContent>
                      </Card>
                      <p className="text-xs text-center mt-1 text-muted-foreground">3D Model</p>
                    </div>
                  )}
                  
                  {/* Image Thumbnails */}
                  {product.images && product.images.map((image, index) => (
                    <div key={image.id} className="flex-shrink-0">
                      <Card 
                        className={`cursor-pointer hover:ring-2 hover:ring-primary transition-all border-2 ${
                          viewMode === 'image' && selectedImageIndex === index ? 'ring-2 ring-primary bg-primary/5 border-primary' : 'border-transparent'
                        }`}
                        onClick={() => {
                          setViewMode('image');
                          setSelectedImageIndex(index);
                        }}
                      >
                        <CardContent className="p-1 w-20 h-20 flex items-center justify-center">
                          <img
                            src={image.image_url}
                            alt={image.alt_text || `${product.name} view ${index + 1}`}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </CardContent>
                      </Card>
                      <p className="text-xs text-center mt-1 text-muted-foreground">Image {index + 1}</p>
                    </div>
                  ))}
                </div>

                {/* Main Display Area */}
                <Card className="overflow-hidden flex-1">
                  <CardContent className="p-0">
                    {viewMode === '3d' ? (
                      // 3D Viewer Display
                      <Product3DViewer 
                        modelUrl={product.model_3d_url}
                        productName={product.name}
                        className="h-96 lg:h-[500px]"
                      />
                    ) : (
                      // Image Display with Zoom
                      product.images && product.images.length > 0 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="relative group cursor-pointer">
                              <img
                                src={product.images[selectedImageIndex]?.image_url}
                                alt={product.images[selectedImageIndex]?.alt_text || product.name}
                                className="w-full h-96 lg:h-[500px] object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <img
                              src={product.images[selectedImageIndex]?.image_url}
                              alt={product.images[selectedImageIndex]?.alt_text || product.name}
                              className="w-full h-auto"
                            />
                          </DialogContent>
                        </Dialog>
                      )
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              {product.category && (
                <Badge variant="secondary" className="mb-2">
                  {product.category.name}
                </Badge>
              )}
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground mb-4">{product.description}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-primary">
                  ₹{(calculatedPrice !== null ? calculatedPrice : "loading...").toLocaleString()}
                </span>
              </div>
              <Badge variant={product.stock_quantity > 0 ? "secondary" : "destructive"}>
                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Out of Stock"}
              </Badge>
            </div>

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

            <div className="flex gap-4">
              {/* Add to Cart Button - Hidden for Admins */}
              {!isAdmin && (
                <Button 
                  className="flex-1" 
                  onClick={handleAddToCart}
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
                onClick={handleWishlistToggle}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Product Customizations */}
            {product.customizations && product.customizations.length > 0 && (
              <>
                <Separator />
                <ProductCustomization
                  customizations={product.customizations}
                  onCustomizationChange={setSelectedCustomizations}
                />
              </>
            )}
          </div>
        </div>

        {/* Product Specifications - Full Width Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-8">Product Specifications</h3>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Specifications Content - Left Side */}
            <ProductSpecifications product={product} />
            
            {/* Price Summary - Right Side */}
            <div className="xl:col-span-1">
              <PriceSummary product={product} onPriceCalculated={handlePriceCalculated} />
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default ProductDetail;