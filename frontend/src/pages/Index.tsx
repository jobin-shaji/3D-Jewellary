import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


import { Product3DViewer } from "@/components/product/Product3DViewer";
import { 
  Star, 
  Truck, 
  Shield, 
  Gem, 
  Award,
  ArrowRight,
  Sparkles
} from "lucide-react";

const Index = () => {
  // Mock featured products
  const featuredProducts = [
    {
      id: 1,
      name: "Diamond Engagement Ring",
      price: 2999,
      compare_price: 3499,
      image: "/placeholder.svg",
      model_3d_url: "",
      rating: 4.9,
      reviews: 156
    },
    {
      id: 2,
      name: "Pearl Necklace",
      price: 899,
      image: "/placeholder.svg",
      model_3d_url: "",
      rating: 4.8,
      reviews: 89
    },
    {
      id: 3,
      name: "Gold Bracelet",
      price: 1299,
      image: "/placeholder.svg",
      model_3d_url: "",
      rating: 4.7,
      reviews: 234
    }
  ];

  return (
    <div className="min-h-screen bg-background">

      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background to-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Sparkles className="w-3 h-3 mr-1" />
                  New Collection Available
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                  Exquisite Jewelry
                  <span className="block text-primary">Crafted to Perfection</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-md">
                  Discover our stunning collection of handcrafted jewelry. Each piece tells a unique story of elegance and sophistication.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link to="/products">
                    Shop Collection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/about">Learn Our Story</Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-8">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Lifetime Warranty</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Free Shipping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Gem className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Certified Gems</span>
                </div>
              </div>
            </div>

            {/* 3D Jewelry Showcase */}
            <div className="relative">
              <Product3DViewer
                productName="Featured Ring"
                className="h-96 w-full"
              />
              <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground rounded-full p-4">
                <Award className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Collection
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Handpicked pieces that represent the pinnacle of craftsmanship and design excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <Product3DViewer
                        modelUrl={product.model_3d_url}
                        productName={product.name}
                        className="h-64"
                      />
                      {product.compare_price && (
                        <Badge className="absolute top-4 left-4 bg-destructive">
                          Save ₹{product.compare_price - product.price}
                        </Badge>
                      )}
                    </div>
                  </Link>
                  
                  <div className="p-6 space-y-4">
                    <div>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({product.reviews} reviews)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-foreground">
                          ₹{product.price}
                        </span>
                        {product.compare_price && (
                          <span className="text-lg text-muted-foreground line-through">
                            ₹{product.compare_price}
                          </span>
                        )}
                      </div>
                      <Button asChild>
                        <Link to={`/product/${product.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link to="/products">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore our carefully curated categories
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Rings", image: "/placeholder.svg", count: "156 items" },
              { name: "Necklaces", image: "/placeholder.svg", count: "89 items" },
              { name: "Earrings", image: "/placeholder.svg", count: "124 items" },
              { name: "Bracelets", image: "/placeholder.svg", count: "67 items" }
            ].map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${category.name.toLowerCase()}`}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                      <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white">
                        <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                        <p className="text-sm opacity-90">{category.count}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;