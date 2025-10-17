import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Heart, ShoppingCart, X, Loader2 } from "lucide-react";
import { useWishlist } from "@/features/user/hooks/useWishlist";
import { useAuth } from "@/shared/contexts/auth";

const Wishlist = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { wishlist, loading, removeFromWishlist } = useWishlist();

  const handleRemoveFromWishlist = async (productId: string) => {
    await removeFromWishlist(productId);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  // If not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-6">
              Please login to view your wishlist
            </p>
            <Button onClick={() => navigate("/login")}>Login</Button>
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
              <p className="text-muted-foreground">Loading wishlist...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              const product = item.product;
              const primaryImage = product.images?.find((img: any) => img.is_primary);
              
              return (
                <Card key={item.productId} className="group cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    <div 
                      className="relative overflow-hidden rounded-t-lg"
                      onClick={() => handleProductClick(product.id)}
                    >
                      {primaryImage ? (
                        <img
                          src={primaryImage.image_url}
                          alt={primaryImage.alt_text || product.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-64 bg-muted flex items-center justify-center">
                          <p className="text-muted-foreground">No image available</p>
                        </div>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWishlist(product.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4" onClick={() => handleProductClick(product.id)}>
                    <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                    <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{product.description}</p>
                    <Badge variant="secondary" className="mb-2">
                      {product.category_id || 'Product'}
                    </Badge>
                    <p className="text-2xl font-bold text-primary">₹{product.makingPrice?.toLocaleString("en-IN") || 0}</p>
                    {product.is_active === false && (
                      <Badge variant="destructive" className="mt-2">Unavailable</Badge>
                    )}
                    {product.stock_quantity <= 0 && product.is_active && (
                      <Badge variant="destructive" className="mt-2">Out of Stock</Badge>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      className="w-full" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/products/${product.id}`);
                      }}
                      disabled={!product.is_active || product.stock_quantity <= 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      View Product
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Save items you love to your wishlist and shop them later
            </p>
            <Button onClick={() => navigate("/products")}>Continue Shopping</Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
