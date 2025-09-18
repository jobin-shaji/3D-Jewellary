import { useParams, useNavigate } from "react-router-dom";


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail } from "lucide-react";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Mock order data
  const order = {
    id: orderId,
    orderNumber: "JW-12345",
    status: "processing",
    paymentStatus: "paid",
    orderDate: "2024-01-15",
    estimatedDelivery: "2024-01-22",
    totalAmount: 2798.82,
    subtotal: 2499,
    tax: 449.82,
    shipping: 99,
    shippingAddress: {
      name: "John Doe",
      address: "123 Main Street, Apartment 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      phone: "+91 98765 43210",
      email: "john.doe@email.com"
    },
    items: [
      {
        id: 1,
        name: "Diamond Engagement Ring",
        price: 2499,
        quantity: 1,
        image: "/placeholder.svg",
        sku: "DR-001",
        customizations: {
          "Ring Size": "7",
          "Metal Type": "White Gold",
          "Engraving": "Forever Yours"
        }
      }
    ],
    tracking: {
      trackingNumber: "JW123456789IN",
      carrier: "BlueDart",
      status: "In Transit",
      updates: [
        {
          date: "2024-01-15",
          time: "10:30 AM",
          status: "Order Confirmed",
          description: "Your order has been confirmed and is being prepared."
        },
        {
          date: "2024-01-16",
          time: "02:15 PM",
          status: "Processing",
          description: "Your jewelry is being crafted by our master artisans."
        },
        {
          date: "2024-01-18",
          time: "11:00 AM",
          status: "Quality Check",
          description: "Item has passed all quality inspections."
        },
        {
          date: "2024-01-19",
          time: "09:45 AM",
          status: "Shipped",
          description: "Your order has been shipped via BlueDart."
        }
      ]
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1 container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/orders")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
            <p className="text-muted-foreground">Placed on {new Date(order.orderDate).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(order.status)}
            <Badge className={getStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 py-4 border-b border-border/50 last:border-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">SKU: {item.sku}</p>
                      <p className="text-sm text-muted-foreground mb-2">Quantity: {item.quantity}</p>
                      {item.customizations && (
                        <div className="mb-2">
                          <p className="text-sm font-medium mb-1">Customizations:</p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(item.customizations).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}: {value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="font-bold text-primary">₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tracking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Tracking Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">Tracking Number</p>
                  <p className="font-mono font-semibold">{order.tracking.trackingNumber}</p>
                  <p className="text-sm text-muted-foreground">Carrier: {order.tracking.carrier}</p>
                </div>

                <div className="space-y-4">
                  {order.tracking.updates.map((update, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        {index < order.tracking.updates.length - 1 && (
                          <div className="w-0.5 h-8 bg-border mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{update.status}</p>
                          <p className="text-sm text-muted-foreground">{update.date} at {update.time}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{update.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Shipping */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>₹{order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{order.shipping.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
                
                <div className="pt-4">
                  <Badge variant={order.paymentStatus === "paid" ? "default" : "destructive"}>
                    Payment {order.paymentStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                <div className="pt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{order.shippingAddress.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{order.shippingAddress.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estimated Delivery */}
            <Card>
              <CardHeader>
                <CardTitle>Estimated Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-primary">
                  {new Date(order.estimatedDelivery).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Your order will be delivered between 10 AM - 6 PM
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                Download Invoice
              </Button>
              <Button className="w-full" variant="outline">
                Contact Support
              </Button>
              {order.status === "delivered" && (
                <Button className="w-full">
                  Rate & Review
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetail;