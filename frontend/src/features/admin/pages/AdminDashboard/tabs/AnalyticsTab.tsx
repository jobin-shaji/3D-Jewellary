import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { StatsCard } from "@/features/admin/pages/AdminDashboard/shared/StatsCard";
import { BarChart3, TrendingUp, Users, ShoppingCart, Package, DollarSign } from "lucide-react";

interface AnalyticsData {
  totalRevenue: number;
  monthlyGrowth: number;
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
}

interface AnalyticsTabProps {
  analyticsData: AnalyticsData;
}

export const AnalyticsTab = ({ analyticsData }: AnalyticsTabProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Overview</h2>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard 
          title="Total Revenue"
          value={formatPrice(analyticsData.totalRevenue)}
          icon={DollarSign}
          description="Total sales revenue"
        />
        <StatsCard 
          title="Monthly Growth"
          value={formatPercentage(analyticsData.monthlyGrowth)}
          icon={TrendingUp}
          description="Month-over-month growth"
        />
        <StatsCard 
          title="Total Users"
          value={analyticsData.totalUsers.toLocaleString()}
          icon={Users}
          description="Registered users"
        />
        <StatsCard 
          title="Total Orders"
          value={analyticsData.totalOrders.toLocaleString()}
          icon={ShoppingCart}
          description="Orders processed"
        />
        <StatsCard 
          title="Total Products"
          value={analyticsData.totalProducts.toLocaleString()}
          icon={Package}
          description="Products in catalog"
        />
        <StatsCard 
          title="Average Order Value"
          value={formatPrice(analyticsData.averageOrderValue)}
          icon={BarChart3}
          description="AOV this month"
        />
      </div>

      {/* Placeholder for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sales Chart</h3>
                <p className="text-gray-500">Sales chart will be implemented here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Growth Chart</h3>
                <p className="text-gray-500">User growth chart will be implemented here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Rings</span>
                <span className="font-medium">45%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Necklaces</span>
                <span className="font-medium">32%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Earrings</span>
                <span className="font-medium">23%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Metals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Gold</span>
                <span className="font-medium">55%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Silver</span>
                <span className="font-medium">30%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Platinum</span>
                <span className="font-medium">15%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-gray-600">New order #12345</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-600">Product "Diamond Ring" updated</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-600">New user registered</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
