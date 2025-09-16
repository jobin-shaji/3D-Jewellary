

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Package, Heart, User, CreditCard, MapPin, Bell, ShoppingBag, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/services/auth";
import { useEffect } from "react";

const UserDashboard = () => {
  const { user: authUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // If not logged in, don't render anything (will redirect)
  if (!isLoggedIn || !authUser) {
    return null;
  }

  // Calculate member since year from createdAt
  const getMemberSince = (createdAt?: string) => {
    if (!createdAt) return new Date().getFullYear().toString();

    try {
      const date = new Date(createdAt);
      return date.getFullYear().toString();
    } catch (error) {
      console.error('Error parsing createdAt date:', error);
      return new Date().getFullYear().toString();
    }
  };

  const memberSince = getMemberSince(authUser.createdAt);

  // Use real user data with fallbacks for dashboard stats
  const user = {
    name: authUser.name,
    email: authUser.email,
    avatar: "/placeholder.svg",
    memberSince,
    totalOrders: authUser.totalOrders || 0,
    totalSpent: authUser.totalSpent || 0,
    loyaltyPoints: authUser.loyaltyPoints || 0
  };

  const recentOrders = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "delivered",
      total: 15000,
      items: 2,
      image: "/placeholder.svg"
    },
    {
      id: "ORD-002", 
      date: "2024-01-10",
      status: "shipped",
      total: 25000,
      items: 1,
      image: "/placeholder.svg"
    },
    {
      id: "ORD-003",
      date: "2024-01-05",
      status: "processing",
      total: 8500,
      items: 3,
      image: "/placeholder.svg"
    }
  ];

  const wishlistItems = [
    { id: 1, name: "Diamond Tennis Bracelet", price: 45000, image: "/placeholder.svg" },
    { id: 2, name: "Emerald Drop Earrings", price: 32000, image: "/placeholder.svg" },
    { id: 3, name: "Gold Chain Necklace", price: 18000, image: "/placeholder.svg" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-800";
      case "shipped": return "bg-blue-100 text-blue-800";
      case "processing": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      

      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-primary">Welcome back, {user.name}!</h1>
              <p className="text-muted-foreground">Member since {user.memberSince}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{user.totalOrders}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">₹{user.totalSpent.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{user.loyaltyPoints}</p>
                    <p className="text-sm text-muted-foreground">Loyalty Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{wishlistItems.length}</p>
                    <p className="text-sm text-muted-foreground">Wishlist Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Your latest jewelry purchases</CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/orders">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <img 
                          src={order.image} 
                          alt="Order item"
                          className="w-12 h-12 rounded-md object-cover"
                        />
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.date} • {order.items} items</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{order.total.toLocaleString()}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Wishlist */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/profile">
                    <MapPin className="mr-2 h-4 w-4" />
                    Manage Addresses
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/profile">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment Methods
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/profile">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Loyalty Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Loyalty Program</CardTitle>
                <CardDescription>You're {500 - (user.loyaltyPoints % 500)} points away from your next reward!</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Points</span>
                    <span>{user.loyaltyPoints}</span>
                  </div>
                  <Progress value={(user.loyaltyPoints % 500) / 5} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Next tier: {Math.ceil(user.loyaltyPoints / 500) * 500} points
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Wishlist Preview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Wishlist</CardTitle>
                  <CardDescription>Items you love</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/wishlist">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {wishlistItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-10 h-10 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">₹{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>


    </div>
  );
};

export default UserDashboard;