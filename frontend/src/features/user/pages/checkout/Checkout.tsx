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
import { Address, Cart } from "@/shared/types";
import ShippingAddressCard from "./ShippingAddressCard";
import OrderSummary from "../../components/OrderSummary";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  
  // Address management
  const { addresses, loading: addressLoading, addAddress } = useAddresses();
  
  // Cart management
  const { cart, loading: cartLoading, fetchCart } = useCart();
  
  const [formData, setFormData] = useState({
    // Payment Info
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    
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
      // Include address and payment details in the order
      const orderData = {
        address: selectedAddress,
        paymentMethod,
        paymentDetails: paymentMethod === "card" ? {
          cardNumber: formData.cardNumber,
          expiryDate: formData.expiryDate,
          cvv: formData.cvv,
          cardName: formData.cardName
        } : null,
        notes: formData.notes,
        items: cart?.items || [],
        subtotal,
        tax,
        shipping,
        total
      };

      // Simulate API call
      console.log("Order data:", orderData);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been confirmed. Redirecting to order details...",
      });
      
      // Redirect to order confirmation
      navigate("/orders/12345");
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
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
                <div>
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="netbanking">Net Banking</SelectItem>
                      <SelectItem value="cod">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === "card" && (
                  <>
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={formData.expiryDate}
                          onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={(e) => handleInputChange("cvv", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input
                        id="cardName"
                        value={formData.cardName}
                        onChange={(e) => handleInputChange("cardName", e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                {paymentMethod === "upi" && (
                  <div>
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input
                      id="upiId"
                      placeholder="yourname@upi"
                      required
                    />
                  </div>
                )}
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
