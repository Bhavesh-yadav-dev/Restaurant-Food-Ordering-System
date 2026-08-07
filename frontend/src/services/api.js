// services/api.js
// Centralised Axios instance and all API call functions.
// Every component imports from here — no fetch/axios calls scattered in pages.
// The baseURL reads from the .env variable; falls back to localhost:5000.

import axios from "axios";

// ─── Axios Instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// ─── Customer — Menu ──────────────────────────────────────────────────────────

/** GET /api/menu — available items only (customer menu page) */
export const fetchCustomerMenu = () => api.get("/menu");

// ─── Customer — Orders ───────────────────────────────────────────────────────

/**
 * POST /api/orders — place a new order
 * @param {{ table_number: number, items: Array }} orderData
 */
export const placeOrder = (orderData) => api.post("/orders", orderData);

// ─── Chef — Auth ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * @param {{ email: string, password: string }} credentials
 */
export const chefLogin = (credentials) => api.post("/auth/login", credentials);

// ─── Chef — Menu Management ───────────────────────────────────────────────────

/** GET /api/menu/all — all items including unavailable (chef dashboard) */
export const fetchAllMenuItems = () => api.get("/menu/all");

/**
 * POST /api/menu — add a new menu item
 * @param {object} itemData - { name, description, price, image?, available }
 */
export const addMenuItem = (itemData) => api.post("/menu", itemData);

/**
 * PUT /api/menu/:id — update an existing menu item
 * @param {number} id
 * @param {object} itemData
 */
export const updateMenuItem = (id, itemData) => api.put(`/menu/${id}`, itemData);

/**
 * DELETE /api/menu/:id — delete a menu item
 * @param {number} id
 */
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);

// ─── Chef — Orders ────────────────────────────────────────────────────────────

/** GET /api/orders — all orders with items (chef dashboard) */
export const fetchAllOrders = () => api.get("/orders");

/**
 * GET /api/orders/:id — single order details
 * @param {number} id
 */
export const fetchOrderDetails = (id) => api.get(`/orders/${id}`);

/**
 * PATCH /api/orders/:id/status — update order status
 * @param {number} id
 * @param {string} status - "Preparing" | "Ready" | "Completed"
 */
export const updateOrderStatus = (id, status) =>
  api.patch(`/orders/${id}/status`, { status });

export default api;
