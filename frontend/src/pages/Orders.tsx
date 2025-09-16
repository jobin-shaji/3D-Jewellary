// import { Header } from "@/components/layout/Header";
// import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, Eye, RefreshCw } from "lucide-react";

const Orders = () => {
  // Mock orders data
  const orders = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "delivered",
      total: 2499,
      items: [
        {
          name: "Diamond Engagement Ring",
          price: 2499,
          quantity: 1,
          image: "/placeholder.svg"
        }
      ]
    },
    {
      id: "ORD-002",
      date: "2024-01-10",
      status: "processing",
      total: 1198,
      items: [
        {
          name: "Gold Necklace",
          price: 899,
          quantity: 1,
          image: "/placeholder.svg"
        },
        {
          name: "Pearl Earrings",
          price: 299,
          quantity: 1,
          image: "/placeholder.svg"
        }
      ]
    },
    {
      id: "ORD-003",
      date: "2024-01-05",
      status: "shipped",
      total: 199,
      items: [
        {
          name: "Silver Bracelet",
          price: 199,
          quantity: 1,
          image: "/placeholder.svg"
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Order {order.id}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <p className="text-lg font-bold mt-1">₹{order.total}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">₹{item.price}</p>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {order.status === "delivered" && (
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reorder
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Track your order
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              When you place your first order, it will appear here
            </p>
            <Button>Start Shopping</Button>
          </div>
        )}
      </main>
      {/* {/* <Footer /> */} */}
    </div>
  );
};

export default Orders;