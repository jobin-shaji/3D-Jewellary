import React, { createContext, useContext, useReducer } from "react";

const CartContext = createContext();

const initialState = {
  items: [], // {id, title, price, qty, thumbnail}
};

function cartReducer(state, action) {
  console.log("Cart state:", state);
  switch (action.type) {
    case "ADD_ITEM":
      const existingIndex = state.items.findIndex(
        (i) => i.id === action.payload.id
      );
      if (existingIndex >= 0) {
        // update qty
        const updatedItems = [...state.items];
        updatedItems[existingIndex].qty += 1;
        return { ...state, items: updatedItems };
      } else {
        return {
          ...state,
          items: [...state.items, { ...action.payload, qty: 1 }],
        };
      }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload),
      };
    case "INCREMENT_QTY":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload ? { ...i, qty: i.qty + 1 } : i
        ),
      };
    case "DECREMENT_QTY":
      return {
        ...state,
        items: state.items
          .map((i) => (i.id === action.payload ? { ...i, qty: i.qty - 1 } : i))
          .filter((i) => i.qty > 0),
      };
    case "CLEAR_CART":
      return initialState;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (item) => dispatch({ type: "ADD_ITEM", payload: item });
  const removeItem = (id) => dispatch({ type: "REMOVE_ITEM", payload: id });
  const incrementQty = (id) => dispatch({ type: "INCREMENT_QTY", payload: id });
  const decrementQty = (id) => dispatch({ type: "DECREMENT_QTY", payload: id });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  return (
    <CartContext.Provider
      value={{
        cart: state,
        addItem,
        removeItem,
        incrementQty,
        decrementQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
