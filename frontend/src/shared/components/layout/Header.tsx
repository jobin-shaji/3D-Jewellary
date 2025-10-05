import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/components/ui/sheet";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Heart,
  Diamond,
  LogOut,
  Settings,
  Package,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useAuth } from "@/shared/contexts/auth";
import { useToast } from "@/shared/hooks/use-toast";
import { useMetalPrices } from "@/shared/hooks/useMetalPrices";
import { useCart } from "@/features/user/hooks/useCart";

export const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, isLoggedIn, logout: authLogout } = useAuth();
  const { toast } = useToast();
  const { metalPrices, loading: metalLoading } = useMetalPrices();
  const { cartCount } = useCart();

  // Get gold and silver prices - using new interface
  const goldPrice = metalPrices.find(metal => metal.type === 'Gold' && metal.purity === '24k');
  const silverPrice = metalPrices.find(metal => metal.type === 'Silver' && metal.purity === 'Sterling');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate with search query if there's input
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    } else {
      // Navigate to products page without search query (show all products)
      navigate('/products');
    }
  };

  const logout = () => {
    console.log("Logging out...");
    authLogout();
    navigate("/");
  };

  // Debugging effect
  useEffect(() => {
    console.log("Header - Auth state:", { user, isLoggedIn });
    console.log(
      "Header - Token in localStorage:",
      localStorage.getItem("token") ? "Present" : "Missing"
    );
  }, [user, isLoggedIn]);

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Diamond className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              LuxeJewels
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 flex-1 justify-center ml-8">
            <Link
              to="/products"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              All
            </Link>
            <Link
              to="/products?category=rings"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Rings
            </Link>
            <Link
              to="/products?category=necklaces"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Necklaces
            </Link>
            <Link
              to="/products?category=earrings"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Earrings
            </Link>
            <Link
              to="/products?category=bracelets"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Bracelets
            </Link>
          </nav>

          {/* Metal Prices - Compact (Medium screens) */}
          <div className="hidden lg:flex xl:hidden items-center space-x-2 px-2" title="Live Metal Prices">
            {metalLoading ? (
              <div className="flex space-x-2">
                <div className="w-16 h-5 bg-muted animate-pulse rounded"></div>
                <div className="w-16 h-5 bg-muted animate-pulse rounded"></div>
              </div>
            ) : (
              <>
                {goldPrice && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-50 rounded border border-yellow-200" title={`24K Gold: ₹${goldPrice.pricePerGram.toFixed(2)}/g (${goldPrice.change > 0 ? '+' : ''}${goldPrice.change.toFixed(1)}%)`}>
                    <span className="text-xs font-bold text-yellow-900">24K Gold</span>
                    <span className="text-xs font-bold text-yellow-900">₹{goldPrice.pricePerGram.toFixed(2)}/g</span>
                  </div>
                )}
                {silverPrice && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-gray-50 rounded border border-gray-200" title={`Silver: ₹${silverPrice.pricePerGram.toFixed(2)}/g (${silverPrice.change > 0 ? '+' : ''}${silverPrice.change.toFixed(1)}%)`}>
                    <span className="text-xs font-bold text-gray-900">Silver</span>
                    <span className="text-xs font-bold text-gray-900">₹{silverPrice.pricePerGram.toFixed(2)}/g</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Metal Prices - Full (Large screens) */}
          <div className="hidden xl:flex items-center space-x-4 px-4" title="Live Metal Prices">
            {metalLoading ? (
              <div className="flex space-x-3">
                <div className="w-24 h-6 bg-muted animate-pulse rounded"></div>
                <div className="w-24 h-6 bg-muted animate-pulse rounded"></div>
              </div>
            ) : (
              <>
                {goldPrice && (
                  <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200" title={`24K Gold: ₹${goldPrice.pricePerGram.toFixed(2)} per gram`}>
                    <span className="text-xs font-medium text-yellow-800">24K Gold</span>
                    <span className="text-sm font-bold text-yellow-900">
                      ₹{goldPrice.pricePerGram.toFixed(2)}/g
                    </span>
                    {goldPrice.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${goldPrice.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {goldPrice.change > 0 ? '+' : ''}{goldPrice.change.toFixed(1)}%
                    </span>
                  </div>
                )}
                {silverPrice && (
                  <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200" title={`Silver: ₹${silverPrice.pricePerGram.toFixed(2)} per gram`}>
                    <span className="text-xs font-medium text-gray-700">Silver</span>
                    <span className="text-sm font-bold text-gray-900">
                      ₹{silverPrice.pricePerGram.toFixed(2)}/g
                    </span>
                    {silverPrice.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${silverPrice.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {silverPrice.change > 0 ? '+' : ''}{silverPrice.change.toFixed(1)}%
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center space-x-2 max-w-sm p-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search jewelry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Wishlist - Only show when logged in and not admin */}
            {isLoggedIn && user?.role !== "admin" && (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/wishlist">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Wishlist</span>
                </Link>
              </Button>
            )}

            {/* Cart - Only show when logged in and not admin */}
            {isLoggedIn && user?.role !== "admin" && (
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartCount}
                    </Badge>
                  )}
                  <span className="sr-only">Shopping cart</span>
                </Link>
              </Button>
            )}

            {/* User Menu */}
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">
                      Welcome back, {user?.name}!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />

                  {/* Conditional menu items based on user role */}
                  {user?.role === "admin" ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard">
                          <User className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/orders">
                          <Package className="mr-2 h-4 w-4" />
                          <span>My Orders</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/wishlist">
                          <Heart className="mr-2 h-4 w-4" />
                          <span>Wishlist</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-4">
                  {/* Metal Prices - Mobile */}
                  <div className="border-b pb-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Live Metal Prices</h3>
                    {metalLoading ? (
                      <div className="flex space-x-2">
                        <div className="w-full h-8 bg-muted animate-pulse rounded"></div>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        {goldPrice && (
                          <div className="flex-1 flex items-center justify-between p-2 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded border border-yellow-200">
                            <div>
                              <span className="text-xs font-medium text-yellow-800">24K Gold</span>
                              <div className="text-sm font-bold text-yellow-900">₹{goldPrice.pricePerGram.toFixed(0)}/g</div>
                            </div>
                            <div className="flex items-center space-x-1">
                              {goldPrice.change >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-600" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-600" />
                              )}
                              <span className={`text-xs font-medium ${goldPrice.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {goldPrice.change > 0 ? '+' : ''}{goldPrice.change.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        )}
                        {silverPrice && (
                          <div className="flex-1 flex items-center justify-between p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded border border-gray-200">
                            <div>
                              <span className="text-xs font-medium text-gray-700">Silver</span>
                              <div className="text-sm font-bold text-gray-900">₹{silverPrice.pricePerGram.toFixed(2)}/g</div>
                            </div>
                            <div className="flex items-center space-x-1">
                              {silverPrice.change >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-600" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-600" />
                              )}
                              <span className={`text-xs font-medium ${silverPrice.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {silverPrice.change > 0 ? '+' : ''}{silverPrice.change.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="flex space-x-2">
                    <Input
                      type="search"
                      placeholder="Search jewelry..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit" size="sm">
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col space-y-4">
                    <Link to="/products" className="text-lg font-medium">
                      All
                    </Link>
                    <Link
                      to="/products?category=rings"
                      className="text-lg font-medium"
                    >
                      Rings
                    </Link>
                    <Link
                      to="/products?category=necklaces"
                      className="text-lg font-medium"
                    >
                      Necklaces
                    </Link>
                    <Link
                      to="/products?category=earrings"
                      className="text-lg font-medium"
                    >
                      Earrings
                    </Link>
                    <Link
                      to="/products?category=bracelets"
                      className="text-lg font-medium"
                    >
                      Bracelets
                    </Link>
                  </nav>

                  {/* Mobile User Actions - Only show when logged in */}
                  {isLoggedIn && (
                    <div className="flex flex-col space-y-2 pt-4 border-t">
                      {/* Wishlist and Cart - Only show for non-admin users */}
                      {user?.role !== "admin" && (
                        <>
                          <Button
                            variant="outline"
                            className="justify-start"
                            asChild
                          >
                            <Link to="/wishlist">
                              <Heart className="mr-2 h-4 w-4" />
                              Wishlist
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            className="justify-start"
                            asChild
                          >
                            <Link to="/cart">
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Cart {cartCount > 0 && `(${cartCount})`}
                            </Link>
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        className="justify-start"
                        asChild
                      >
                        <Link to={user?.role === "admin" ? "/admin" : "/dashboard"}>
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={logout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  )}

                  {/* Mobile Auth Buttons - Only show when not logged in */}
                  {!isLoggedIn && (
                    <div className="flex flex-col space-y-2 pt-4 border-t">
                      <Button variant="outline" asChild>
                        <Link to="/login">Login</Link>
                      </Button>
                      <Button asChild>
                        <Link to="/register">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
