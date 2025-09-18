import { useParams, useNavigate, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
  Box
} from "lucide-react";
import { Product3DViewer } from "@/components/product/Product3DViewer";
import ProductCustomization from "@/components/product/ProductCustomization";
import { useState, useEffect } from "react";
import { Product } from "@/types";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string | number>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [viewMode, setViewMode] = useState<'3d' | 'image'>('3d'); // Track current view mode

  // Fetch product data from backend
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`http://localhost:3000/api/products/${id}/full`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Product not found');
          } else {
            throw new Error('Failed to fetch product details');
          }
          return;
        }

        const productData = await response.json();
        setProduct(productData);

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
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
        toast({
          title: "Error",
          description: "Failed to load product details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, toast]);

  const handleAddToCart = () => {
    if (!product) return;
    
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
              <span className="text-3xl font-bold text-primary">₹{product.price}</span>
              <Badge variant={product.stock_quantity > 0 ? "secondary" : "destructive"}>
                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Out of Stock"}
              </Badge>
            </div>

            {/* Quantity Selector */}
            {product.stock_quantity > 0 && (
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
              <Button 
                className="flex-1" 
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.stock_quantity > 0 ? "Add to Cart" : "Out of Stock"}
              </Button>
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
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Metal Information */}
            {product.metals && product.metals.length > 0 && (
              <div>
                <h4 className="text-xl font-semibold mb-4">Metal Details</h4>
                <div className="space-y-4">
                  {product.metals.map((metal, index) => (
                    <div key={index} className="border-b border-primary/20 pb-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Type</span>
                          <p className="font-semibold text-foreground">{metal.type}</p>
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Purity</span>
                          <p className="font-semibold text-foreground">{metal.purity}</p>
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Weight</span>
                          <p className="font-semibold text-foreground">{metal.weight}g</p>
                        </div>
                        {metal.color && (
                          <div>
                            <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Color</span>
                            <p className="font-semibold text-foreground">{metal.color}</p>
                          </div>
                        )}
                        {metal.percentage && (
                          <div>
                            <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Percentage</span>
                            <p className="font-semibold text-foreground">{metal.percentage}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gemstone Information */}
            {product.gemstones && product.gemstones.length > 0 && (
              <div>
                <h4 className="text-xl font-semibold mb-4">Gemstone Details</h4>
                <div className="space-y-4">
                  {product.gemstones.map((gemstone, index) => (
                    <div key={index} className="border-b border-primary/20 pb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <h5 className="text-lg font-semibold text-primary">
                          {gemstone.type} × {gemstone.count}
                        </h5>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Carat</span>
                          <p className="font-semibold text-foreground">{gemstone.carat}ct</p>
                        </div>
                        {gemstone.cut && (
                          <div>
                            <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Cut</span>
                            <p className="font-semibold text-foreground">{gemstone.cut}</p>
                          </div>
                        )}
                        {gemstone.color && (
                          <div>
                            <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Color</span>
                            <p className="font-semibold text-foreground">{gemstone.color}</p>
                          </div>
                        )}
                        {gemstone.clarity && (
                          <div>
                            <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Clarity</span>
                            <p className="font-semibold text-foreground">{gemstone.clarity}</p>
                          </div>
                        )}
                        {gemstone.shape && (
                          <div>
                            <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Shape</span>
                            <p className="font-semibold text-foreground">{gemstone.shape}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General Specifications */}
            <div>
              <h4 className="text-xl font-semibold mb-4">General Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="font-medium text-muted-foreground">Category</span>
                  <span className="font-medium">{product.category?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="font-medium text-muted-foreground">Availability</span>
                  <Badge variant={product.stock_quantity > 0 ? "secondary" : "destructive"}>
                    {product.stock_quantity > 0 ? 'Available' : 'Currently Unavailable'}
                  </Badge>
                </div>
                {product.certificates && product.certificates.length > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-muted-foreground">Certificates</span>
                    <span className="font-medium text-right">
                      {product.certificates.map(cert => cert.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Care Instructions */}
            <div>
              <h4 className="text-xl font-semibold mb-4">Care Instructions</h4>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-2 text-sm">
                    <p className="flex items-start space-x-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Store in a soft cloth pouch or jewelry box</span>
                    </p>
                    <p className="flex items-start space-x-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Clean gently with a soft brush and mild soap</span>
                    </p>
                    <p className="flex items-start space-x-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Avoid exposure to harsh chemicals</span>
                    </p>
                    <p className="flex items-start space-x-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Remove before swimming or exercising</span>
                    </p>
                    <p className="flex items-start space-x-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Professional cleaning recommended annually</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default ProductDetail;