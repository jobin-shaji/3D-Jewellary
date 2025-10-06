import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Minus, Plus, Trash2, Loader2, ShoppingBag } from "lucide-react";
import { useCart } from "@/features/user/hooks/useCart";
import { useAuth } from "@/shared/contexts/auth";

const Cart = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { cart, loading, updateCartItem, clearCart } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  // Handle quantity update
  const handleQuantityUpdate = async (productId: string, variantId: string, newQuantity: number) => {
    const itemKey = `${productId}-${variantId}`;
    setUpdatingItems(prev => new Set(prev).add(itemKey));

    try {
      await updateCartItem(productId, variantId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  // Handle item removal
  const handleRemoveItem = async (productId: string, variantId: string) => {
    await handleQuantityUpdate(productId, variantId, 0);
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your cart...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Empty cart state
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some beautiful jewelry to your cart!</p>
            <Button asChild>
              <Link to="/products">Continue Shopping</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          {cart.items.length > 0 && (
            <Button variant="outline" onClick={handleClearCart}>
              Clear Cart
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cart.items.map((item) => {
              const itemKey = `${item.productId}-${item.variant_id}`;
              const isUpdating = updatingItems.has(itemKey);

              return (
                <Card key={itemKey} className="mb-4">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image?.image_url || "/placeholder.svg"}
                        alt={item.image?.alt_text || item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-2xl font-bold text-primary">₹{item.priceAtPurchase.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{item.priceAtPurchase.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={isUpdating || item.quantity <= 1}
                          onClick={() => handleQuantityUpdate(item.productId, item.variant_id, item.quantity - 1)}
                        >
                          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4" />}
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          className="w-16 text-center"
                          readOnly
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={isUpdating}
                          onClick={() => handleQuantityUpdate(item.productId, item.variant_id, item.quantity + 1)}
                        >
                          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        disabled={isUpdating}
                        onClick={() => handleRemoveItem(item.productId, item.variant_id)}
                      >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.totalItems} items)</span>
                  <span>₹{cart.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹99.00</span> {/* TODO: Calculate actual shipping */}
                </div>
                <div className="flex justify-between">
                  <span>GST (3% included)</span>
                  <span>₹{(cart.totalAmount * 0.03).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{(cart.totalAmount + 99).toFixed(2)}</span>
                </div>
                <Button className="w-full" size="lg" asChild>
                  <Link to="/checkout">Proceed to Checkout</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
