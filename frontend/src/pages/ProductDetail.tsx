import { useParams, useNavigate } from "react-router-dom";
// import { Header } from "@/components/layout/Header";
// import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heart, ShoppingCart, ArrowLeft, Star, Loader2 } from "lucide-react";
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

  // Mock product data for fallback (keeping as reference)
  const mockProduct = {
    id: Number(id),
    name: "Diamond Engagement Ring",
    price: 2499,
    originalPrice: 2999,
    category: "rings",
    image: "/placeholder.svg",
    model3d: "", // No 3D model - will use fallback
    description: "Exquisite diamond engagement ring crafted with precision and elegance. This stunning piece features a brilliant cut diamond set in premium white gold.",
    fullDescription: "This breathtaking diamond engagement ring represents the perfect symbol of eternal love. Meticulously crafted by our master jewelers, it features a stunning 1.5-carat brilliant cut diamond as the centerpiece, surrounded by smaller diamonds that enhance its radiance. The band is made from the finest 18k white gold, ensuring both durability and timeless beauty.",
    specifications: {
      "Material": "18k White Gold",
      "Diamond Weight": "1.5 carats",
      "Diamond Cut": "Brilliant",
      "Diamond Color": "D (Colorless)",
      "Diamond Clarity": "VVS1",
      "Ring Size": "Adjustable",
      "Certification": "GIA Certified"
    },
    customizations: [
      {
        id: "ring_size",
        name: "Ring Size",
        type: "select" as const,
        options: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"],
        required: true,
        default_value: "7"
      },
      {
        id: "metal_type",
        name: "Metal Type",
        type: "select" as const,
        options: ["White Gold", "Yellow Gold", "Rose Gold", "Platinum"],
        required: true,
        default_value: "White Gold"
      },
      {
        id: "engraving",
        name: "Engraving",
        type: "text" as const,
        required: false
      }
    ],
    inStock: true,
    rating: 4.8,
    reviews: 124
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Add to cart logic with customizations
    console.log("Added to cart:", product.id, "with customizations:", selectedCustomizations);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* <Header /> */}
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading product details...</p>
            </div>
          </div>
        </main>
        {/* {/* <Footer /> */} 
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* <Header /> */}
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
        {/* {/* <Footer /> */} 
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}
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
          {/* Product Images and 3D Viewer */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <Product3DViewer 
                  modelUrl={product.model_3d_url}
                  productName={product.name}
                  className="h-96 lg:h-[500px]"
                />
              </CardContent>
            </Card>
            
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image, index) => (
                  <Card key={image.id} className="cursor-pointer hover:ring-2 hover:ring-primary">
                    <CardContent className="p-2">
                      <img
                        src={image.image_url}
                        alt={image.alt_text || `${product.name} view ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                    </CardContent>
                  </Card>
                ))}
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
              <span className="text-3xl font-bold text-primary">${product.price}</span>
              <Badge variant={product.stock_quantity > 0 ? "secondary" : "destructive"}>
                {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>

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
            </div>

            <Separator />

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

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Specifications</h3>
              <div className="space-y-4">
                
                {/* Metal Information */}
                {product.metals && product.metals.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Metal Details</h4>
                    <div className="space-y-2">
                      {product.metals.map((metal, index) => (
                        <div key={index} className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm">
                            <span className="font-medium">Type:</span> {metal.type}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Purity:</span> {metal.purity}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Weight:</span> {metal.weight}g
                          </div>
                          {metal.color && (
                            <div className="text-sm">
                              <span className="font-medium">Color:</span> {metal.color}
                            </div>
                          )}
                          {metal.percentage && (
                            <div className="text-sm">
                              <span className="font-medium">Percentage:</span> {metal.percentage}%
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gemstone Information */}
                {product.gemstones && product.gemstones.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Gemstone Details</h4>
                    <div className="space-y-2">
                      {product.gemstones.map((gemstone, index) => (
                        <div key={index} className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm">
                            <span className="font-medium">Type:</span> {gemstone.type}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Carat:</span> {gemstone.carat}ct
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Count:</span> {gemstone.count}
                          </div>
                          {gemstone.cut && (
                            <div className="text-sm">
                              <span className="font-medium">Cut:</span> {gemstone.cut}
                            </div>
                          )}
                          {gemstone.color && (
                            <div className="text-sm">
                              <span className="font-medium">Color:</span> {gemstone.color}
                            </div>
                          )}
                          {gemstone.clarity && (
                            <div className="text-sm">
                              <span className="font-medium">Clarity:</span> {gemstone.clarity}
                            </div>
                          )}
                          {gemstone.shape && (
                            <div className="text-sm">
                              <span className="font-medium">Shape:</span> {gemstone.shape}
                            </div>
                          )}
                          {gemstone.setting && (
                            <div className="text-sm">
                              <span className="font-medium">Setting:</span> {gemstone.setting}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* General Specifications */}
                <div>
                  <h4 className="font-medium mb-2">General Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="font-medium">Category:</span>
                      <span className="text-muted-foreground">{product.category?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="font-medium">Availability:</span>
                      <span className="text-muted-foreground">{product.stock_quantity > 0 ? 'Available' : 'Currently Unavailable'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="font-medium">Warranty:</span>
                      <span className="text-muted-foreground">Lifetime Warranty</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="font-medium">Free Shipping:</span>
                      <span className="text-muted-foreground">Yes</span>
                    </div>
                  </div>
                </div>

                {/* Care Instructions */}
                <div>
                  <h4 className="font-medium mb-2">Care Instructions</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Store in a soft cloth pouch or jewelry box</p>
                    <p>• Clean gently with a soft brush and mild soap</p>
                    <p>• Avoid exposure to harsh chemicals</p>
                    <p>• Remove before swimming or exercising</p>
                    <p>• Professional cleaning recommended annually</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* {/* <Footer /> */} 
    </div>
  );
};

export default ProductDetail;