import React from "react";
import { useCart } from "../context/CartContext.jsx";

export default function Cart() {
  const { cart, incrementQty, decrementQty, removeItem, clearCart } = useCart();

  const totalPrice = cart.items.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center text-white">
        <h2 className="text-2xl font-semibold">🛒 Your cart is empty.</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">🛍️ Your Cart</h1>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Items</h2>
          <button
            onClick={clearCart}
            className="bg-red-600 hover:bg-red-700 transition-colors text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md"
          >
            Clear Cart
          </button>
        </div>

        <div className="space-y-6">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center bg-purple-800/30 backdrop-blur-sm border border-purple-600/30 rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-20 h-20 object-contain rounded-md bg-purple-700/30 p-2"
              />

              <div className="ml-4 flex-1">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-purple-300">${item.price.toFixed(2)}</p>

                <div className="flex items-center mt-2 space-x-2">
                  <button
                    onClick={() => decrementQty(item.id)}
                    className="px-3 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-sm"
                  >
                    -
                  </button>
                  <span className="text-lg font-bold">{item.qty}</span>
                  <button
                    onClick={() => incrementQty(item.id)}
                    className="px-3 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="text-red-400 hover:text-red-600 text-2xl font-bold ml-4"
                aria-label={`Remove ${item.title} from cart`}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 text-right">
          <h2 className="text-2xl font-bold">
            Total: <span className="text-green-300">${totalPrice.toFixed(2)}</span>
          </h2>
        </div>
      </div>
    </div>
  );
}
