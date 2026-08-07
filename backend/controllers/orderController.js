// controllers/orderController.js
// Handles placing orders (customer) and managing orders (chef).

import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} from "../models/orderModel.js";
import { sendSuccess, sendError } from "../utils/response.js";

// Valid status transitions enforced server-side
const VALID_STATUSES = ["Pending", "Preparing", "Ready", "Completed"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Takes the flat JOIN rows from the DB and groups them into
 * a structured array of orders, each with a nested `items` array.
 *
 * Raw row shape:
 *   { order_id, table_number, total_amount, status, order_time,
 *     item_id, menu_id, quantity, price, subtotal, item_name }
 */
const groupOrderRows = (rows) => {
  const ordersMap = new Map();

  for (const row of rows) {
    if (!ordersMap.has(row.order_id)) {
      ordersMap.set(row.order_id, {
        id: row.order_id,
        table_number: row.table_number,
        total_amount: row.total_amount,
        status: row.status,
        order_time: row.order_time,
        updated_at: row.updated_at,
        items: [],
      });
    }

    // Only push if there is actually an order item (LEFT JOIN can produce nulls)
    if (row.item_id) {
      ordersMap.get(row.order_id).items.push({
        id: row.item_id,
        menu_id: row.menu_id,
        name: row.item_name,
        quantity: row.quantity,
        price: row.price,
        subtotal: row.subtotal,
      });
    }
  }

  return Array.from(ordersMap.values());
};

// ─── Customer ─────────────────────────────────────────────────────────────────

/**
 * POST /api/orders
 * Place a new order.
 * Body: { table_number, items: [{ menu_id, quantity, price }] }
 *
 * subtotal and total_amount are calculated server-side to prevent
 * the client from sending manipulated prices.
 */
export const placeOrder = async (req, res, next) => {
  try {
    const { table_number, items } = req.body;

    // --- Validation ---
    if (!table_number || !items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 400, "table_number and a non-empty items array are required");
    }
    if (isNaN(table_number) || Number(table_number) < 1) {
      return sendError(res, 400, "table_number must be a positive integer");
    }

    // Validate each item and compute subtotals
    const processedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      if (!item.menu_id || !item.quantity || !item.price) {
        return sendError(res, 400, "Each item must have menu_id, quantity, and price");
      }
      if (item.quantity < 1) {
        return sendError(res, 400, "Item quantity must be at least 1");
      }

      const subtotal = Number(item.price) * Number(item.quantity);
      totalAmount += subtotal;

      processedItems.push({
        menu_id: item.menu_id,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal,
      });
    }

    const orderId = await createOrder(
      Number(table_number),
      totalAmount,
      processedItems
    );

    return sendSuccess(res, 201, "Order placed successfully", {
      order_id: orderId,
      table_number: Number(table_number),
      total_amount: totalAmount,
      status: "Pending",
    });
  } catch (error) {
    next(error);
  }
};

// ─── Chef ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/orders
 * Get all orders with their items (chef dashboard).
 */
export const getOrders = async (req, res, next) => {
  try {
    const rows = await getAllOrders();
    const orders = groupOrderRows(rows);
    return sendSuccess(res, 200, "Orders fetched successfully", orders);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id
 * Get a single order with all its items.
 */
export const getOrderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rows = await getOrderById(Number(id));

    if (rows.length === 0) {
      return sendError(res, 404, "Order not found");
    }

    const [order] = groupOrderRows(rows);
    return sendSuccess(res, 200, "Order fetched successfully", order);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/orders/:id/status
 * Update the status of an order.
 * Body: { status: "Preparing" | "Ready" | "Completed" }
 */
export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // --- Validation ---
    if (!status) {
      return sendError(res, 400, "Status is required");
    }
    if (!VALID_STATUSES.includes(status)) {
      return sendError(
        res,
        400,
        `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`
      );
    }

    const affectedRows = await updateOrderStatus(Number(id), status);
    if (affectedRows === 0) {
      return sendError(res, 404, "Order not found");
    }

    return sendSuccess(res, 200, "Order status updated", {
      order_id: Number(id),
      status,
    });
  } catch (error) {
    next(error);
  }
};
