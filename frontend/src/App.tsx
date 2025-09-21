import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/shared/contexts/auth";
import Index from "@/shared/pages/Index";
import Products from "@/features/products/pages/Products";
import ProductDetail from "@/features/products/pages/productDetail/ProductDetail";
// import ProductDetail from "./pages/productDetails_old.tsx";
import ProductManagement from "@/features/admin/pages/productManagement/ProductManagement";
import Cart from "@/features/user/pages/Cart";
import Checkout from "@/features/user/pages/Checkout";
import OrderDetail from "@/features/user/pages/OrderDetail";
import Wishlist from "@/features/user/pages/Wishlist";
import Login from "@/features/auth/pages/Login";
import Register from "@/features/auth/pages/Register";
import Profile from "@/features/user/pages/Profile";
import UserDashboard from "@/features/user/pages/UserDashboard";
import Orders from "@/features/user/pages/Orders";
import AdminDashboard from "@/features/admin/pages/AdminDashboard/AdminDashboard";
import NotFound from "@/shared/pages/NotFound";
import Layout from "@/shared/components/layout/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders/:orderId" element={<OrderDetail />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route
                path="/admin/products/new"
                element={<ProductManagement />}
              />
              <Route
                path="/admin/products/edit/:id"
                element={<ProductManagement />}
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>{" "}
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
