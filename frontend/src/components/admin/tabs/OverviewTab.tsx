import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Users, ShoppingCart, DollarSign, Eye, RefreshCw, Loader2 } from "lucide-react";
import { StatsCard, MetalPriceCard } from "../shared";

interface MetalPrice {
  name: string;
  symbol: string;
  price: number;
  change: number;
}

interface Order {
  id: string;
  customer: string;
  total: number;
  status: string;
  date: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
}

interface OverviewTabProps {
  stats: DashboardStats;
  recentOrders: Order[];
  metalPrices: MetalPrice[];
  metalPricesLoading: boolean;
  refreshPrices: () => void;
  loading: boolean;
}

export const OverviewTab = ({ stats, recentOrders, metalPrices, metalPricesLoading, refreshPrices, loading }: OverviewTabProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "processing": return "bg-yellow-500";
      case "shipped": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts}
          description="Products in catalog"
          icon={Package}
        />
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          description="Registered users"
          icon={Users}
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          description="Orders processed"
          icon={ShoppingCart}
        />
        <StatsCard
          title="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          description="Total sales revenue"
          icon={DollarSign}
        />
      </div>

      {/* Metal Prices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Precious Metal Prices</span>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPrices}
              disabled={metalPricesLoading}
            >
              <RefreshCw className={`h-4 w-4 ${metalPricesLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metalPricesLoading ? (
              <div className="flex items-center justify-center col-span-full p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              metalPrices.map((metalPrice) => (
                <MetalPriceCard 
                  key={metalPrice.symbol} 
                  metal={metalPrice.name}
                  price={metalPrice.price}
                  change={metalPrice.change}
                  changePercent={metalPrice.change}
                  currency="USD"
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
};
