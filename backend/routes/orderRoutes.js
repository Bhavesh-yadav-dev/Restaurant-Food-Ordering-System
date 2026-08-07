// routes/orderRoutes.js
// Order routes for both customer and chef.
// Mounted at /api/orders in server.js
//
// Route map:
//   POST   /api/orders            → customer: place a new order
//   GET    /api/orders            → chef: get all orders
//   GET    /api/orders/:id        → chef: get single order details
//   PATCH  /api/orders/:id/status → chef: update order status
//
// PATCH is used for status updates (partial update) instead of PUT
// because we are only changing one field, not replacing the whole order.

import { Router } from "express";
import {
  placeOrder,
  getOrders,
  getOrderDetails,
  updateStatus,
} from "../controllers/orderController.js";

const router = Router();

// ── Customer ──────────────────────────────────────────────────────────────────
router.post("/", placeOrder);

// ── Chef ──────────────────────────────────────────────────────────────────────
router.get("/", getOrders);
router.get("/:id", getOrderDetails);
router.patch("/:id/status", updateStatus);

export default router;
