import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  Eye,
  Loader2,
  TrendingDown,
  Minus
} from "lucide-react";
import { useAuth } from "@/services/auth";

interface Product {
  id: string;
  name: string;
  price: number;
  category_id: number;
  description: string;
  stock_quantity: number;
  is_active: boolean;
  featured: boolean;
  category?: {
    id: number;
    name: string;
  };
  primaryImage?: {
    image_url: string;
    alt_text: string;
  };
}

interface PreciousMetalPrice {
  metal: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

const AdminDashboard = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [metalPrices, setMetalPrices] = useState<PreciousMetalPrice[]>([]);
  const [metalPricesLoading, setMetalPricesLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'admin') {
      navigate('/login');
    }
  }, [isLoggedIn, user, navigate]);

  // Fetch precious metal prices
  const fetchMetalPrices = async () => {
    try {
      setMetalPricesLoading(true);
      
      // Using a free API for precious metal prices (you can replace with your preferred API)
      // For demo purposes, I'll use mock data. Replace with actual API call.
      
      // Example API call (replace with your preferred metals API):
      // const response = await fetch('https://api.metals.live/v1/spot');
      
      // Mock data for demonstration - replace with real API
      const mockPrices: PreciousMetalPrice[] = [
        {
          metal: "Gold",
          price: 2034.50,
          change: 12.30,
          changePercent: 0.61,
          currency: "USD"
        },
        {
          metal: "Silver",
          price: 24.67,
          change: -0.45,
          changePercent: -1.79,
          currency: "USD"
        }
      ];
      
      setMetalPrices(mockPrices);
      
      // Uncomment below for real API integration:
      /*
      const response = await fetch('https://api.metals.live/v1/spot');
      if (response.ok) {
        const data = await response.json();
        const prices = [
          {
            metal: "Gold",
            price: data.gold,
            change: data.gold_change,
            changePercent: data.gold_change_percent,
            currency: "USD"
          },
          {
            metal: "Silver", 
            price: data.silver,
            change: data.silver_change,
            changePercent: data.silver_change_percent,
            currency: "USD"
          }
        ];
        setMetalPrices(prices);
      }
      */
      
    } catch (error) {
      console.error('Failed to fetch metal prices:', error);
      // Set fallback prices if API fails
      setMetalPrices([
        { metal: "Gold", price: 2034.50, change: 0, changePercent: 0, currency: "USD" },
        { metal: "Silver", price: 24.67, change: 0, changePercent: 0, currency: "USD" }
      ]);
    } finally {
      setMetalPricesLoading(false);
    }
  };

  // Fetch products from database
  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching products for admin dashboard...');
      
      const response = await fetch('http://localhost:3000/api/products/with-primary-images?limit=50');
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      console.log('📦 Products received:', data);
      setProducts(data.products || []);
      
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete product with double-click confirmation
  const [deleteAttempts, setDeleteAttempts] = useState<{[key: string]: number}>({});

  const deleteProduct = async (productId: string, productName: string) => {
    const attempts = deleteAttempts[productId] || 0;
    
    if (attempts === 0) {
      // First click - show warning
      setDeleteAttempts(prev => ({ ...prev, [productId]: 1 }));
      
      toast({
        title: "Confirm Delete",
        description: `Click delete again to permanently delete "${productName}"`,
        variant: "destructive",
        duration: 3000,
      });

      // Reset after 3 seconds
      setTimeout(() => {
        setDeleteAttempts(prev => ({ ...prev, [productId]: 0 }));
      }, 3000);
      
      return;
    }

    // Second click - actually delete
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });

      // Reset delete attempts and refresh
      setDeleteAttempts(prev => ({ ...prev, [productId]: 0 }));
      fetchProducts();
      
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch data when component mounts or when switching tabs
  useEffect(() => {
    fetchMetalPrices();
    if (activeTab === "products" || activeTab === "overview") {
      fetchProducts();
    }
  }, [activeTab]);

  // Refresh metal prices every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchMetalPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isLoggedIn || user?.role !== 'admin') {
    return null;
  }

  // Mock data for other sections (we'll replace these later)
  const stats = {
    totalProducts: products.length,
    totalUsers: 1247,
    totalOrders: 389,
    totalRevenue: 45230
  };

  const recentOrders = [
    { id: "ORD-001", customer: "John Doe", total: 1299, status: "completed", date: "2024-01-15" },
    { id: "ORD-002", customer: "Jane Smith", total: 899, status: "processing", date: "2024-01-15" },
    { id: "ORD-003", customer: "Mike Johnson", total: 2499, status: "shipped", date: "2024-01-14" }
  ];

  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", orders: 5, joined: "2023-12-01" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", orders: 3, joined: "2024-01-05" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", orders: 7, joined: "2023-11-15" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "processing": return "bg-yellow-500";
      case "shipped": return "bg-blue-500";
      case "active": return "bg-green-500";
      case "out_of_stock": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getProductStatus = (product: Product) => {
    if (!product.is_active) return "inactive";
    if (product.stock_quantity === 0) return "out_of_stock";
    return "active";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatMetalPrice = (price: number, metal: string) => {
    return `$${price.toFixed(2)}/${metal === 'Gold' ? 'oz' : 'oz'}`;
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          
          {/* Precious Metal Prices */}
          <div className="flex items-center space-x-4">
            {metalPricesLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-500">Loading prices...</span>
              </div>
            ) : (
              metalPrices.map((metal) => (
                <Card key={metal.metal} className="p-3 min-w-[140px]">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        metal.metal === 'Gold' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                      <span className="font-medium text-sm">{metal.metal}</span>
                    </div>
                    {getPriceChangeIcon(metal.change)}
                  </div>
                  <div className="mt-1">
                    <div className="font-bold text-lg">
                      {formatMetalPrice(metal.price, metal.metal)}
                    </div>
                    <div className={`text-xs flex items-center space-x-1 ${getPriceChangeColor(metal.change)}`}>
                      <span>{metal.change >= 0 ? '+' : ''}{metal.change.toFixed(2)}</span>
                      <span>({metal.changePercent >= 0 ? '+' : ''}{metal.changePercent.toFixed(2)}%)</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards - Updated with real product count */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    {products.filter(p => p.is_active).length} active products
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">+23% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{formatPrice(order.total)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">All Products</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/products")}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Store
                </Button>
                <Button onClick={() => navigate("/admin/products/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Product
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Product Inventory ({products.length} items)</span>
                  {loading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading products...</span>
                  </div>
                ) : products.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-3">
                              {product.primaryImage ? (
                                <img
                                  src={product.primaryImage.image_url}
                                  alt={product.primaryImage.alt_text}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                  <Package className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {product.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">
                            {product.category?.name || 'Uncategorized'}
                          </TableCell>
                          <TableCell>{formatPrice(product.price)}</TableCell>
                          <TableCell>
                            <span className={`${
                              product.stock_quantity === 0 
                                ? 'text-destructive' 
                                : product.stock_quantity < 10 
                                ? 'text-yellow-600' 
                                : 'text-green-600'
                            }`}>
                              {product.stock_quantity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(getProductStatus(product))}>
                                {getProductStatus(product).replace('_', ' ')}
                              </Badge>
                              {product.featured && (
                                <Badge variant="secondary">Featured</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => navigate(`/products/${product.id}`)}
                                title="View Product"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                title="Edit Product"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteProduct(product.id, product.name)}
                                title={deleteAttempts[product.id] ? "Click again to confirm delete" : "Delete Product"}
                                className={`${deleteAttempts[product.id] ? 'bg-red-100 text-red-700' : 'text-destructive hover:text-destructive'}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500 mb-4">Get started by creating your first product.</p>
                    <Button onClick={() => navigate("/admin/products/new")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold">Order Management</h2>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{formatPrice(order.total)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <h2 className="text-2xl font-bold">User Management</h2>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.orders}</TableCell>
                        <TableCell>{user.joined}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Sales Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Sales analytics chart would go here</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Top selling products chart would go here</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;