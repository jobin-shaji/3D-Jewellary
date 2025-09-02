import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
} from "lucide-react";
import { useAuth } from "@/services/auth";

import { useToast } from "@/hooks/use-toast";

export const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const { toast } = useToast();

  // Mock data - replace with actual state management
  const cartItemsCount = 3;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

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
          <nav className="hidden lg:flex items-center space-x-6 flex-1 justify-center">
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
            {/* Wishlist - Only show when logged in */}
            {isLoggedIn && (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/wishlist">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Wishlist</span>
                </Link>
              </Button>
            )}

            {/* Cart - Only show when logged in */}
            {isLoggedIn && (
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartItemsCount}
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
                  <DropdownMenuItem onClick={handleLogout}>
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
                          Cart {cartItemsCount > 0 && `(${cartItemsCount})`}
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start"
                        asChild
                      >
                        <Link to="/dashboard">
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={handleLogout}
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
