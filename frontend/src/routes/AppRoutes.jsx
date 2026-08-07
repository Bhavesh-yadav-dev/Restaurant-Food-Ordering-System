// routes/AppRoutes.jsx
// Defines all client-side routes using React Router v6.
//
// Route map:
//
//  Customer side (no login required):
//    /menu/:tableNumber      → MenuPage       (customer scans QR → views menu)
//    /cart                   → CartPage       (customer reviews cart)
//    /order-confirmation     → OrderConfirmationPage
//
//  Chef side:
//    /chef/login             → LoginPage
//    /chef/dashboard         → DashboardPage  (links to menu mgmt + orders)
//    /chef/menu              → MenuManagementPage
//    /chef/orders            → OrdersDashboardPage
//
//  Fallback:
//    /                       → redirects to /chef/login (default landing)
//    *                       → redirects to /chef/login (404 fallback)

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Customer pages
import MenuPage              from "../pages/customer/MenuPage.jsx";
import CartPage              from "../pages/customer/CartPage.jsx";
import OrderConfirmationPage from "../pages/customer/OrderConfirmationPage.jsx";

// Chef pages
import LoginPage             from "../pages/chef/LoginPage.jsx";
import DashboardPage         from "../pages/chef/DashboardPage.jsx";
import MenuManagementPage    from "../pages/chef/MenuManagementPage.jsx";
import OrdersDashboardPage   from "../pages/chef/OrdersDashboardPage.jsx";
import QRGeneratorPage       from "../pages/chef/QRGeneratorPage.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ── Customer ─────────────────────────────────────────────────────── */}
      <Route path="/menu/:tableNumber"  element={<MenuPage />} />
      <Route path="/cart"               element={<CartPage />} />
      <Route path="/order-confirmation" element={<OrderConfirmationPage />} />

      {/* ── Chef ─────────────────────────────────────────────────────────── */}
      <Route path="/chef/login"         element={<LoginPage />} />
      <Route path="/chef/dashboard"     element={<DashboardPage />} />
      <Route path="/chef/menu"          element={<MenuManagementPage />} />
      <Route path="/chef/orders"        element={<OrdersDashboardPage />} />
      <Route path="/chef/qr-generator"  element={<QRGeneratorPage />} />

      {/* ── Fallback ─────────────────────────────────────────────────────── */}
      <Route path="/" element={<Navigate to="/chef/login" replace />} />
      <Route path="*" element={<Navigate to="/chef/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
