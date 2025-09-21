import { Link } from "react-router-dom";
import { Diamond, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";

export const Footer = () => {
  return (
    <footer className="bg-muted/50 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Diamond className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">LuxeJewels</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Crafting exquisite jewelry with passion and precision. Discover our collection of 
              handcrafted pieces that celebrate life's special moments.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon">
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Youtube className="h-4 w-4" />
                <span className="sr-only">YouTube</span>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Shop</h3>
            <div className="space-y-2 text-sm">
              <Link to="/products" className="block text-muted-foreground hover:text-foreground transition-colors">
                All Jewelry
              </Link>
              <Link to="/products?category=rings" className="block text-muted-foreground hover:text-foreground transition-colors">
                Rings
              </Link>
              <Link to="/products?category=necklaces" className="block text-muted-foreground hover:text-foreground transition-colors">
                Necklaces
              </Link>
              <Link to="/products?category=earrings" className="block text-muted-foreground hover:text-foreground transition-colors">
                Earrings
              </Link>
              <Link to="/products?category=bracelets" className="block text-muted-foreground hover:text-foreground transition-colors">
                Bracelets
              </Link>
              <Link to="/products?featured=true" className="block text-muted-foreground hover:text-foreground transition-colors">
                Featured Items
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Customer Service</h3>
            <div className="space-y-2 text-sm">
              <Link to="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                Contact Us
              </Link>
              <Link to="/shipping" className="block text-muted-foreground hover:text-foreground transition-colors">
                Shipping Information
              </Link>
              <Link to="/returns" className="block text-muted-foreground hover:text-foreground transition-colors">
                Returns & Exchanges
              </Link>
              <Link to="/size-guide" className="block text-muted-foreground hover:text-foreground transition-colors">
                Size Guide
              </Link>
              <Link to="/care" className="block text-muted-foreground hover:text-foreground transition-colors">
                Jewelry Care
              </Link>
              <Link to="/faq" className="block text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
            </div>
          </div>

          {/* Newsletter & Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Stay Connected</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for exclusive offers and new arrivals.
            </p>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1"
                />
                <Button size="sm">Subscribe</Button>
              </div>
            </div>
            
            <div className="space-y-3 pt-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@luxejewels.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>123 Diamond Street, NYC 10001</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2024 LuxeJewels. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
