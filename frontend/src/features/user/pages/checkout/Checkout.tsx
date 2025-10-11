import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { useToast } from "@/shared/hooks/use-toast";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useAddresses } from "../../hooks/useAddresses";
import { useCart } from "../../hooks/useCart";
import { useOrders } from "../../hooks/useOrders";
import { useRazorpay } from "../../hooks/useRazorpay";
import { Address, Cart } from "@/shared/types";
import ShippingAddressCard from "./ShippingAddressCard";
import OrderSummary from "../../components/OrderSummary";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  
  // Address management
  const { addresses, loading: addressLoading, addAddress } = useAddresses();
  
  // Cart management
  const { cart, loading: cartLoading, fetchCart } = useCart();
  
  // Order management
  const { createPaymentOrder, verifyPayment } = useOrders();
  
  // Razorpay integration
  const { openRazorpay } = useRazorpay();
  
  const [formData, setFormData] = useState({
    // Order Notes
    notes: ""
  });

  // Calculate totals from real cart data
  const subtotal = cart?.totalAmount || 0;
  const tax = subtotal * 0.03; // 3% GST for jewelry
  const shipping = cart && cart.items.length > 0 ? 99 : 0; // No shipping for empty cart
  const total = subtotal + tax + shipping;

  // Fetch cart data on component mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Set default address when addresses are loaded
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addresses, selectedAddressId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddAddress = async (addressData: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newAddress = await addAddress(addressData);
      setSelectedAddressId(newAddress.id);
      setIsAddressDialogOpen(false);
      toast({
        title: "Address Added",
        description: "Your new address has been added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add address.",
        variant: "destructive"
      });
    }
  };

  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

  const handlePlaceOrder = async () => {
    // Validate cart has items
    if (!cart || !cart.items || cart.items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checkout.",
        variant: "destructive"
      });
      return;
    }

    // Validate address selection
    if (!selectedAddressId || !selectedAddress) {
      toast({
        title: "Address Required",
        description: "Please select a delivery address before placing your order.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Prepare order data for the API
      const orderData = {
        address: selectedAddress,
        paymentMethod: 'razorpay',
        notes: formData.notes,
        items: cart.items,
        subtotal,
        tax,
        shipping,
        total
      };

      console.log("Creating payment order with data:", orderData);
      
      // Step 1: Create payment order (creates order + Razorpay order)
      const paymentOrder = await createPaymentOrder(orderData);
      
      console.log("Payment order created:", paymentOrder);
      
      // Step 2: Open Razorpay checkout
      await openRazorpay({
        orderId: paymentOrder.orderId,
        razorpayOrderId: paymentOrder.razorpayOrderId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency || 'INR',
        userDetails: {
          name: selectedAddress.firstName + ' ' + selectedAddress.lastName,
          email: '', // Add user email if available
          contact: selectedAddress.phone
        },
        onSuccess: async (response) => {
          try {
            console.log("Payment successful, verifying:", response);
            
            // Step 3: Verify payment
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: response.orderId
            });
            
            // Step 4: Redirect to success page
            navigate(`/order-confirmation/${response.orderId}`);
            
          } catch (verifyError) {
            console.error("Payment verification failed:", verifyError);
            toast({
              title: "Payment Verification Failed",
              description: "Your payment was processed but verification failed. Please contact support.",
              variant: "destructive"
            });
          }
        },
        onFailure: (error) => {
          console.error("Payment failed:", error);
          
          let errorMessage = "Payment failed. Please try again.";
          
          if (error.error && error.error.code === 'PAYMENT_CANCELLED') {
            errorMessage = "Payment was cancelled.";
          } else if (error.error && error.error.description) {
            errorMessage = error.error.description;
          }
          
          toast({
            title: "Payment Failed",
            description: errorMessage,
            variant: "destructive"
          });
        }
      });
      
    } catch (error: any) {
      console.error("Order creation failed:", error);
      toast({
        title: "Order Creation Failed",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1 container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/cart")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Loading State */}
        {cartLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your cart...</p>
          </div>
        )}

        {/* Empty Cart State */}
        {!cartLoading && (!cart || !cart.items || cart.items.length === 0) && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
            <Button onClick={() => navigate("/products")}>
              Continue Shopping
            </Button>
          </div>
        )}

        {/* Checkout Form - Only show if cart has items */}
        {!cartLoading && cart && cart.items && cart.items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <ShippingAddressCard
              addresses={addresses}
              addressLoading={addressLoading}
              selectedAddressId={selectedAddressId}
              isAddressDialogOpen={isAddressDialogOpen}
              onAddressSelect={setSelectedAddressId}
              onAddressDialogOpenChange={setIsAddressDialogOpen}
              onAddAddress={handleAddAddress}
            />

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Payment Method</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      You'll be redirected to Razorpay for secure payment processing
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border rounded-lg p-3 text-center">
                      <div className="text-sm font-medium">Credit/Debit Cards</div>
                      <div className="text-xs text-muted-foreground">Visa, Mastercard, RuPay</div>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <div className="text-sm font-medium">UPI</div>
                      <div className="text-xs text-muted-foreground">GPay, PhonePe, Paytm</div>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <div className="text-sm font-medium">Net Banking</div>
                      <div className="text-xs text-muted-foreground">All major banks</div>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <div className="text-sm font-medium">Wallets</div>
                      <div className="text-xs text-muted-foreground">Paytm, MobiKwik</div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Secure Payment</span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      All payments are processed securely through Razorpay with 256-bit SSL encryption
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any special instructions for your order..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <OrderSummary
              cart={cart}
              onPlaceOrder={handlePlaceOrder}
              isProcessing={isProcessing}
            />
          </div>
        </div>
        )}
      </main>
    </div>
  );
};

export default Checkout;
