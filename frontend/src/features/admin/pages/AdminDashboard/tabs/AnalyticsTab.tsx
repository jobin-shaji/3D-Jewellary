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
  Database
} from "lucide-react";

// ============================================
// DUMMY DATA - Replace these with props later
// ============================================

const DUMMY_DATA = {
  // Key Metrics
  totalRevenue: 2567890,
  totalOrders: 456,
  averageOrderValue: 5628,
  
  // Refunds/Returns
  totalRefunds: 12,
  refundValue: 67500,
  returnRate: 2.6, // percentage
  
  // Inventory
  lowStockProducts: 8,
  outOfStockProducts: 3,
  lowStockItems: [
    { id: 1, name: "Diamond Ring - 18K Gold", stock: 2 },
    { id: 2, name: "Pearl Necklace", stock: 1 },
    { id: 3, name: "Silver Bracelet", stock: 3 },
  ],
  outOfStockItems: [
    { id: 4, name: "Platinum Earrings" },
    { id: 5, name: "Gold Chain" },
  ],
  
  // Best Selling Products
  bestSellingProducts: [
    { id: 1, name: "Diamond Engagement Ring", sales: 145, revenue: 435000, trend: "up" },
    { id: 2, name: "Gold Wedding Band", sales: 98, revenue: 294000, trend: "up" },
    { id: 3, name: "Pearl Necklace Set", sales: 76, revenue: 228000, trend: "down" },
    { id: 4, name: "Silver Earrings", sales: 65, revenue: 130000, trend: "up" },
    { id: 5, name: "Platinum Ring", sales: 42, revenue: 210000, trend: "up" },
  ],
  
  // Sales Trends Data (for chart - 7 days)
  salesTrends: [
    { date: "Mon", sales: 45000 },
    { date: "Tue", sales: 52000 },
    { date: "Wed", sales: 38000 },
    { date: "Thu", sales: 65000 },
    { date: "Fri", sales: 71000 },
    { date: "Sat", sales: 89000 },
    { date: "Sun", sales: 67000 },
  ],
  
  // User Growth Data (for chart - 6 months)
  userGrowth: [
    { month: "Jan", users: 120 },
    { month: "Feb", users: 145 },
    { month: "Mar", users: 178 },
    { month: "Apr", users: 210 },
    { month: "May", users: 267 },
    { month: "Jun", users: 312 },
  ],
};

// ============================================
// COMPONENT
// ============================================

export const NewAnalyticsTab = () => {
  const [salesTimeFrame, setSalesTimeFrame] = useState("7days");
  const [userGrowthTimeFrame, setUserGrowthTimeFrame] = useState("6months");

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

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector and Download Options */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        
        <div className="flex flex-wrap gap-2">
          {/* Date Range Selector */}
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
          
          {/* Download Reports Dropdown */}
          <Button variant="outline" size="sm" onClick={() => handleDownloadReport('revenue-csv')}>
            <Download className="h-4 w-4 mr-2" />
            Revenue Report (CSV)
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownloadReport('sales-pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Sales Report (PDF)
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownloadReport('inventory-xml')}>
            <Download className="h-4 w-4 mr-2" />
            Inventory Report (XML)
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownloadReport('tax-report')}>
            <FileText className="h-4 w-4 mr-2" />
            Tax Report
          </Button>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Revenue"
          value={formatPrice(DUMMY_DATA.totalRevenue)}
          icon={DollarSign}
          description="Last 30 days"
        />
        <StatsCard 
          title="Total Orders"
          value={DUMMY_DATA.totalOrders.toLocaleString()}
          icon={ShoppingCart}
          description="Orders processed"
        />
        <StatsCard 
          title="Average Order Value"
          value={formatPrice(DUMMY_DATA.averageOrderValue)}
          icon={BarChart3}
          description="Per transaction"
        />
        <StatsCard 
          title="Refunds/Returns"
          value={DUMMY_DATA.totalRefunds.toLocaleString()}
          icon={RotateCcw}
          description={`${formatPrice(DUMMY_DATA.refundValue)} (${DUMMY_DATA.returnRate}%)`}
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
            <div className="h-64 flex items-end justify-around gap-2 border-b border-l border-gray-300 p-4">
              {DUMMY_DATA.salesTrends.map((day, index) => {
                const maxSales = Math.max(...DUMMY_DATA.salesTrends.map(d => d.sales));
                const heightPercent = (day.sales / maxSales) * 100;
                
                return (
                  <div key={index} className="flex flex-col items-center gap-1 flex-1">
                    <div className="text-xs font-medium text-gray-700 mb-1">
                      {formatPrice(day.sales)}
                    </div>
                    <div 
                      className="w-full bg-primary rounded-t transition-all duration-300 hover:bg-primary/80 cursor-pointer"
                      style={{ height: `${heightPercent}%`, minHeight: '20px' }}
                    />
                    <span className="text-xs text-gray-600 mt-2">{day.date}</span>
                  </div>
                );
              })}
            </div>
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
            <div className="h-64 flex items-end justify-around gap-2 border-b border-l border-gray-300 p-4">
              {DUMMY_DATA.userGrowth.map((month, index) => {
                const maxUsers = Math.max(...DUMMY_DATA.userGrowth.map(m => m.users));
                const heightPercent = (month.users / maxUsers) * 100;
                
                return (
                  <div key={index} className="flex flex-col items-center gap-1 flex-1">
                    <div className="text-xs font-medium text-gray-700 mb-1">
                      {month.users}
                    </div>
                    <div 
                      className="w-full bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600 cursor-pointer"
                      style={{ height: `${heightPercent}%`, minHeight: '20px' }}
                    />
                    <span className="text-xs text-gray-600 mt-2">{month.month}</span>
                  </div>
                );
              })}
            </div>
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
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {DUMMY_DATA.outOfStockProducts} Out of Stock
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {DUMMY_DATA.lowStockProducts} Low Stock
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Low Stock Items */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-orange-600">Low Stock Items</h4>
                <div className="space-y-2">
                  {DUMMY_DATA.lowStockItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-orange-50 rounded border border-orange-200">
                      <span className="text-sm">{item.name}</span>
                      <Badge variant="outline" className="bg-orange-100">
                        {item.stock} left
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Out of Stock Items */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-red-600">Out of Stock</h4>
                <div className="space-y-2">
                  {DUMMY_DATA.outOfStockItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-200">
                      <span className="text-sm">{item.name}</span>
                      <Badge variant="destructive">0 stock</Badge>
                    </div>
                  ))}
                </div>
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
            <div className="space-y-3">
              {DUMMY_DATA.bestSellingProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatPrice(product.revenue)}</p>
                    <div className="flex items-center gap-1">
                      {product.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={`text-xs ${product.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                        {product.trend === "up" ? "↑" : "↓"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            >
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-semibold">Export Full Report</p>
                  <p className="text-xs text-gray-500">Download comprehensive analytics (PDF/CSV)</p>
                </div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start h-auto py-4"
              onClick={() => handleDownloadReport('raw-data')}
            >
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-semibold">Export Raw Data</p>
                  <p className="text-xs text-gray-500">Download raw data in CSV/Excel for analysis</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
