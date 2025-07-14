import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import Homepage from "./pages/HomePage";
import SearchObjects from "./pages/SearchObjects";
import Cart from "./pages/Cart";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Header />
        {/* <main style={{ padding: "1rem" }}> */}
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/search" element={<SearchObjects />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        {/* </main> */}
      </BrowserRouter>
    </CartProvider>
  );
}