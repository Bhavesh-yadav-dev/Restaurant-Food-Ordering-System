// src/App.jsx
// Root component. Wraps the app with the Cart context provider
// and renders the application routes.

import React from "react";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
