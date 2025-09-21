import { useState } from "react";
import { useNavigate } from "react-router-dom";


import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Heart, ShoppingCart, X } from "lucide-react";

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: "Diamond Engagement Ring",
      price: 2499,
      category: "rings",
      image: "/placeholder.svg",
      description: "Beautiful diamond engagement ring"
    },
    {
      id: 3,
      name: "Pearl Earrings",
      price: 299,
      category: "earrings",
      image: "/placeholder.svg",
      description: "Classic pearl earrings"
    }
  ]);

  const handleRemoveFromWishlist = (itemId: number) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  // Remove the mock wishlist data that was here before

  return (
    <div className="min-h-screen flex flex-col">
      

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
            <Card key={item.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div 
                  className="relative overflow-hidden rounded-t-lg"
                  onClick={() => handleProductClick(item.id)}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromWishlist(item.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4" onClick={() => handleProductClick(item.id)}>
                <CardTitle className="text-lg mb-2">{item.name}</CardTitle>
                <p className="text-muted-foreground text-sm mb-2">{item.description}</p>
                <Badge variant="secondary" className="mb-2">
                  {item.category}
                </Badge>
                <p className="text-2xl font-bold text-primary">₹{item.price}</p>
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
        ) : (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Save items you love to your wishlist and shop them later
            </p>
            <Button>Continue Shopping</Button>
          </div>
        )}
      </main>

    </div>
  );
};

export default Wishlist;
