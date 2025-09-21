import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useAuth } from "@/shared/contexts/auth";
import { useAdminDashboard } from "@/features/admin/hooks/useAdminDashboard";
import { useMetalPrices } from "@/shared/hooks/useMetalPrices";
import { useProducts } from "@/features/products/hooks/useProducts";

// Import new tab components
import { 
  OverviewTab, 
  ProductsTab, 
  OrdersTab, 
  UsersTab, 
  AnalyticsTab 
} from "@/features/admin/pages/AdminDashboard/tabs";


const AdminDashboard = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Custom hooks for data management
  const { 
    stats, 
    orders, 
    users, 
    analyticsData, 
    loading: dashboardLoading,
    error: dashboardError,
    refreshData,
    getRecentOrders 
  } = useAdminDashboard();

  const { 
    metalPrices, 
    loading: metalPricesLoading, 
    error: metalPricesError,
    refreshPrices 
  } = useMetalPrices();

  const { 
    products, 
    loading: productsLoading, 
    error: productsError,
    refreshProducts 
  } = useProducts();

  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'admin') {
      navigate('/login');
    }
  }, [isLoggedIn, user, navigate]);

  if (!isLoggedIn || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">

      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
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
              <OverviewTab 
                stats={stats}
                recentOrders={getRecentOrders()}
                metalPrices={metalPrices}
                metalPricesLoading={metalPricesLoading}
                refreshPrices={refreshPrices}
                loading={dashboardLoading}
              />
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <ProductsTab 
                products={products}
                loading={productsLoading}
                onProductDelete={refreshProducts}
              />
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <OrdersTab orders={orders} />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UsersTab users={users} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsTab analyticsData={analyticsData} />
            </TabsContent>
          </Tabs>
        </div>
      </main>


    </div>
  );
};

export default AdminDashboard;
