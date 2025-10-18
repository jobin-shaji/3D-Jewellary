import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { StatsCard } from "@/features/admin/pages/AdminDashboard/shared/StatsCard";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { 
  DollarSign, 
  ShoppingCart, 
  BarChart3, 
  TrendingUp, 
  Package, 
  AlertTriangle,
  RotateCcw,
  Download,
  Calendar,
  FileText,
  TrendingDown,
  Database,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useAnalytics, Period, Interval } from "@/features/admin/hooks/useAnalytics";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";

// Map UI timeframe values to API period values
const timeFrameToPeriod = (timeframe: string): Period => {
  switch (timeframe) {
    case '7days': return '7d';
    case '30days': return '30d';
    case '90days': return '90d';
    case '1year': return '1y';
    case '3months': return '90d';
    case '6months': return '90d'; // Using 90d as closest match
    default: return '30d';
  }
};

const timeFrameToInterval = (timeframe: string): Interval => {
  switch (timeframe) {
    case '7days': return 'day';
    case '30days': return 'day';
    case '90days': return 'week';
    case '3months': return 'week';
    case '6months': return 'month';
    case '1year': return 'month';
    default: return 'day';
  }
};

// Format label based on date string
const formatChartLabel = (dateStr: string, interval: Interval): string => {
  if (interval === 'day') {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else if (interval === 'week') {
    return dateStr; // Week format from backend
  } else {
    const date = new Date(dateStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short' });
  }
};

export const NewAnalyticsTab = () => {
  const [salesTimeFrame, setSalesTimeFrame] = useState("30days");
  const [userGrowthTimeFrame, setUserGrowthTimeFrame] = useState("30days");

  const period = timeFrameToPeriod(salesTimeFrame);
  const salesInterval = timeFrameToInterval(salesTimeFrame);
  const userInterval = timeFrameToInterval(userGrowthTimeFrame);

  const {
    overview,
    salesTrends,
    userGrowth,
    inventory,
    bestSellers,
    loading,
    error,
    refetch
  } = useAnalytics({
    period,
    salesInterval,
    userInterval,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleDownloadReport = (type: string) => {
    console.log(`Downloading ${type} report...`);
    // TODO: Implement actual download logic
  };

  // Loading State
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-lg font-medium text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Analytics</AlertTitle>
          <AlertDescription className="mt-2">
            {error}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!overview || !inventory) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            No analytics data available at the moment. Please check back later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate derived data
  const totalRevenue = overview.revenue.total;
  const totalOrders = overview.orders.total;
  const averageOrderValue = overview.revenue.avgOrderValue;
  const revenueChange = overview.revenue.change;

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector and Download Options */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <Button 
            onClick={refetch} 
            variant="ghost" 
            size="sm"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Date Range Display */}
          <Button variant="outline" size="sm" disabled>
            <Calendar className="h-4 w-4 mr-2" />
            {salesTimeFrame === '7days' && 'Last 7 Days'}
            {salesTimeFrame === '30days' && 'Last 30 Days'}
            {salesTimeFrame === '90days' && 'Last 90 Days'}
            {salesTimeFrame === '1year' && 'Last Year'}
          </Button>
          
          {/* Download Reports (Disabled for now - TODO) */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDownloadReport('revenue-csv')}
            disabled
          >
            <Download className="h-4 w-4 mr-2" />
            Revenue Report
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDownloadReport('sales-pdf')}
            disabled
          >
            <Download className="h-4 w-4 mr-2" />
            Sales Report
          </Button>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Revenue"
          value={formatPrice(totalRevenue)}
          icon={DollarSign}
          description={`${revenueChange >= 0 ? '↑' : '↓'} ${Math.abs(revenueChange).toFixed(1)}% from previous period`}
        />
        <StatsCard 
          title="Total Orders"
          value={totalOrders.toLocaleString()}
          icon={ShoppingCart}
          description="Orders processed"
        />
        <StatsCard 
          title="Average Order Value"
          value={formatPrice(averageOrderValue)}
          icon={BarChart3}
          description="Per transaction"
        />
        <StatsCard 
          title="New Users"
          value={overview.users.newUsers.toLocaleString()}
          icon={TrendingUp}
          description={`${overview.users.growth >= 0 ? '↑' : '↓'} ${Math.abs(overview.users.growth).toFixed(1)}% growth`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trends Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sales Trends
              </CardTitle>
              <Select value={salesTimeFrame} onValueChange={setSalesTimeFrame}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {salesTrends.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No sales data available for this period</p>
              </div>
            ) : (
              <div className="h-64 flex items-end justify-around gap-2 border-b border-l border-gray-300 p-4">
                {salesTrends.map((day, index) => {
                  const maxSales = Math.max(...salesTrends.map(d => d.revenue), 1);
                  const heightPercent = (day.revenue / maxSales) * 100;
                  
                  return (
                    <div key={index} className="flex flex-col items-center gap-1 flex-1">
                      <div className="text-xs font-medium text-gray-700 mb-1">
                        {formatPrice(day.revenue)}
                      </div>
                      <div 
                        className="w-full bg-primary rounded-t transition-all duration-300 hover:bg-primary/80 cursor-pointer"
                        style={{ height: `${heightPercent}%`, minHeight: '20px' }}
                        title={`${day.orders} orders`}
                      />
                      <span className="text-xs text-gray-600 mt-2">
                        {formatChartLabel(day.date, salesInterval)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                User Growth
              </CardTitle>
              <Select value={userGrowthTimeFrame} onValueChange={setUserGrowthTimeFrame}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {userGrowth.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No user growth data available for this period</p>
              </div>
            ) : (
              <div className="h-64 flex items-end justify-around gap-2 border-b border-l border-gray-300 p-4">
                {userGrowth.map((period, index) => {
                  const maxUsers = Math.max(...userGrowth.map(m => m.newUsers), 1);
                  const heightPercent = (period.newUsers / maxUsers) * 100;
                  
                  return (
                    <div key={index} className="flex flex-col items-center gap-1 flex-1">
                      <div className="text-xs font-medium text-gray-700 mb-1">
                        {period.newUsers}
                      </div>
                      <div 
                        className="w-full bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600 cursor-pointer"
                        style={{ height: `${heightPercent}%`, minHeight: '20px' }}
                      />
                      <span className="text-xs text-gray-600 mt-2">
                        {formatChartLabel(period.date, userInterval)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inventory Status & Best Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory Status
              </span>
              <div className="flex gap-2">
                {inventory.outOfStock > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {inventory.outOfStock} Out of Stock
                  </Badge>
                )}
                {inventory.lowStock > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1 bg-orange-50 text-orange-700 border-orange-300">
                    <AlertTriangle className="h-3 w-3" />
                    {inventory.lowStock} Low Stock
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold">{inventory.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Stock</p>
                  <p className="text-2xl font-bold text-green-600">{inventory.inStock}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-orange-600">{inventory.lowStock}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">{inventory.outOfStock}</p>
                </div>
              </div>

              {/* Inventory Value */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-gray-600 mb-1">Total Inventory Value</p>
                <p className="text-2xl font-bold text-primary">{formatPrice(inventory.totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Best Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bestSellers.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No sales data available for this period</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bestSellers.map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sold} sales</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-semibold text-sm whitespace-nowrap">{formatPrice(product.revenue)}</p>
                      <div className="flex items-center gap-1 justify-end">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">↑</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions / Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="justify-start h-auto py-4"
              onClick={() => handleDownloadReport('full-report')}
              disabled
            >
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-semibold">Export Full Report</p>
                  <p className="text-xs text-gray-500">Download comprehensive analytics (Coming soon)</p>
                </div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start h-auto py-4"
              onClick={() => handleDownloadReport('raw-data')}
              disabled
            >
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-semibold">Export Raw Data</p>
                  <p className="text-xs text-gray-500">Download raw data in CSV/Excel (Coming soon)</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
