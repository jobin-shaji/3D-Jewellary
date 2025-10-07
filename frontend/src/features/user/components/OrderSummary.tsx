import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Cart } from "@/shared/types";
import { ReactNode } from "react";

interface OrderSummaryProps {
  cart: Cart | null;
  showCheckoutButton?: boolean;
  checkoutPath?: string;
  customButton?: ReactNode;
  showSecurityMessage?: boolean;
}


export const OrderSummary = ({ 
  cart,
  showCheckoutButton = true, 
  checkoutPath = "/checkout",
  customButton,
  showSecurityMessage = false
}: OrderSummaryProps) => {
  if (!cart) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your cart is empty.</p>
        </CardContent>
      </Card>
    );
  }

  const { items, totalAmount, totalItems } = cart;
  const subtotal = totalAmount;
  const gst = subtotal * 0.03;
  const shipping = 99.00; // TODO: Calculate actual shipping
  const total = subtotal + gst + shipping;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items List */}
        <div className="mb-4">
          <div className="font-semibold mb-2">Items</div>
          <ul className="divide-y divide-border/30">
            {items.map((item) => (
              <li key={`${item.productId}-${item.variant_id || ''}`} className="flex justify-between items-start py-2">
                <div>
                  <p className="text-base font-normal">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <span className="font-normal">₹{(item.totalprice * item.quantity).toLocaleString("en-IN")}</span>
              </li>
            ))}
          </ul>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between">
          <span>GST (3%)</span>
          <span>₹{gst.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₹{shipping.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>
        
        {/* Custom button (for checkout page) or default checkout button (for cart page) */}
        {customButton ? (
          customButton
        ) : showCheckoutButton ? (
          <Button className="w-full" size="lg" asChild>
            <Link to={checkoutPath}>Proceed to Checkout</Link>
          </Button>
        ) : null}
        
        {/* Optional security message */}
        {showSecurityMessage && (
          <p className="text-xs text-center text-muted-foreground">
            Your payment information is secure and encrypted
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderSummary;