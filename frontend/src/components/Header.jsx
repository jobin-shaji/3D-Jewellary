import React, { useState, useEffect } from "react";

import { Search, ShoppingCart, Box, Menu, X } from "lucide-react";

import { Link, useLocation } from 'react-router-dom';

import { useCart } from "../context/CartContext";


export default function Header() {
  const { cart } = useCart();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getTotalQty = () => cart.items.reduce((acc, i) => acc + i.qty, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActiveLink = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-slate-900/95 backdrop-blur-md border-b border-white/10' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Box className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              3D Marketplace
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`relative px-3 py-2 rounded-lg transition-all duration-200 ${
                isActiveLink('/') 
                  ? 'text-white bg-white/10 backdrop-blur-sm' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
              {isActiveLink('/') && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
              )}
            </Link>
            
            <Link 
              to="/search" 
              className={`relative px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                isActiveLink('/search') 
                  ? 'text-white bg-white/10 backdrop-blur-sm' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search Objects</span>
              {isActiveLink('/search') && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
              )}
            </Link>
            
            <Link 
              to="/cart" 
              className={`relative px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                isActiveLink('/cart') 
                  ? 'text-white bg-white/10 backdrop-blur-sm' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {getTotalQty() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {getTotalQty()}
                  </span>
                )}
              </div>
              <span>Cart</span>
              {isActiveLink('/cart') && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-white transition-colors p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                to="/" 
                className={`block px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActiveLink('/') 
                    ? 'text-white bg-white/10 backdrop-blur-sm' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              
              <Link 
                to="/search" 
                className={`block px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  isActiveLink('/search') 
                    ? 'text-white bg-white/10 backdrop-blur-sm' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="w-4 h-4" />
                <span>Search Objects</span>
              </Link>
              
              <Link 
                to="/cart" 
                className={`block px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  isActiveLink('/cart') 
                    ? 'text-white bg-white/10 backdrop-blur-sm' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4" />
                  {getTotalQty() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {getTotalQty()}
                    </span>
                  )}
                </div>
                <span>Cart</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}