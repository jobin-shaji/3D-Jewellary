import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
// import { Header } from "@/components/layout/Header";
// import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import { Product3DViewer } from "@/components/product/Product3DViewer";

const Products = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const [wishlistedItems, setWishlistedItems] = useState<number[]>([]);

  // Mock products data
  const products = [
    {
      id: 1,
      name: "Diamond Engagement Ring",
      price: 2499,
      category: "rings",
      image: "/placeholder.svg",
      description: "Beautiful diamond engagement ring"
    },
    {
      id: 2,
      name: "Gold Necklace",
      price: 899,
      category: "necklaces",
      image: "/placeholder.svg",
      description: "Elegant gold necklace"
    },
    {
      id: 3,
      name: "Pearl Earrings",
      price: 299,
      category: "earrings",
      image: "/placeholder.svg",
      description: "Classic pearl earrings"
    },
    {
      id: 4,
      name: "Silver Bracelet",
      price: 199,
      category: "bracelets",
      image: "/placeholder.svg",
      description: "Modern silver bracelet"
    }
  ];

  const filteredProducts = products.filter(product => {
    if (category && product.category !== category) return false;
    if (search && !product.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getTitle = () => {
    if (search) return `Search results for "${search}"`;
    if (category) return category.charAt(0).toUpperCase() + category.slice(1);
    return "All Products";
  };

  const handleWishlistToggle = (productId: number) => {
    setWishlistedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}
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
                  <Product3DViewer
                    modelUrl=""
                    productName={product.name}
                    className="h-64"
                  />
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
                  {product.category}
                </Badge>
                <p className="text-2xl font-bold text-primary">₹{product.price}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full" onClick={(e) => e.stopPropagation()}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found</p>
          </div>
        )}
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default Products;