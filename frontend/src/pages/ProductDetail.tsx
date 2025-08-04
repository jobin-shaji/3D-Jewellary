import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heart, ShoppingCart, ArrowLeft, Star } from "lucide-react";
import { Product3DViewer } from "@/components/product/Product3DViewer";
import ProductCustomization from "@/components/product/ProductCustomization";
import { useState } from "react";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string | number>>({});

  // Mock product data - replace with API call
  const product = {
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
    // Add to cart logic with customizations
    console.log("Added to cart:", product.id, "with customizations:", selectedCustomizations);
    navigate("/checkout");
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    console.log(isWishlisted ? "Removed from wishlist" : "Added to wishlist", product.id);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
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
                  modelUrl={product.model3d}
                  productName={product.name}
                  className="h-96 lg:h-[500px]"
                />
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((_, index) => (
                <Card key={index} className="cursor-pointer hover:ring-2 hover:ring-primary">
                  <CardContent className="p-2">
                    <img
                      src={product.image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            <div className="flex gap-4">
              <Button 
                className="flex-1" 
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
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

            <div>
              <h3 className="text-lg font-semibold mb-4">Product Details</h3>
              <p className="text-muted-foreground mb-4">{product.fullDescription}</p>
            </div>

            {/* Product Customizations */}
            {product.customizations && product.customizations.length > 0 && (
              <ProductCustomization
                customizations={product.customizations}
                onCustomizationChange={setSelectedCustomizations}
              />
            )}

            <div>
              <h3 className="text-lg font-semibold mb-4">Specifications</h3>
              <div className="space-y-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-border/50">
                    <span className="font-medium">{key}:</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;