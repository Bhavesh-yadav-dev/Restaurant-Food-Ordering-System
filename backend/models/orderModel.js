// models/orderModel.js
// All database queries related to orders and order_items tables.
// Uses a transaction when inserting a new order + its items so that
// if any item insert fails, the entire order is rolled back cleanly.

import pool from "../config/db.js";

/**
 * Get all orders with their items joined in.
 * Returns each order_item as a separate row; the controller
 * will group them by order ID if needed.
 */
export const getAllOrders = async () => {
  const [rows] = await pool.execute(
    `SELECT
       o.id           AS order_id,
       o.table_number,
       o.total_amount,
       o.status,
       o.created_at   AS order_time,
       o.updated_at,
       oi.id          AS item_id,
       oi.menu_id,
       oi.quantity,
       oi.price,
       oi.subtotal,
       m.name         AS item_name
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN menu m         ON oi.menu_id = m.id
     ORDER BY o.created_at DESC`
  );
  return rows;
};

/**
 * Get a single order with all its items.
 * @param {number} orderId
 */
export const getOrderById = async (orderId) => {
  const [rows] = await pool.execute(
    `SELECT
       o.id           AS order_id,
       o.table_number,
       o.total_amount,
       o.status,
       o.created_at   AS order_time,
       o.updated_at,
       oi.id          AS item_id,
       oi.menu_id,
       oi.quantity,
       oi.price,
       oi.subtotal,
       m.name         AS item_name
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN menu m         ON oi.menu_id = m.id
     WHERE o.id = ?`,
    [orderId]
  );
  return rows;
};

/**
 * Create a new order along with all its order items in a single transaction.
 * If anything fails, the whole thing rolls back — no orphan records.
 *
 * @param {number} tableNumber
 * @param {number} totalAmount
 * @param {Array}  items - [{ menu_id, quantity, price, subtotal }, ...]
 * @returns {number} The new order's ID
 */
export const createOrder = async (tableNumber, totalAmount, items) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Insert the order header
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (table_number, total_amount, status)
       VALUES (?, ?, 'Pending')`,
      [tableNumber, totalAmount]
    );
    const orderId = orderResult.insertId;

    // 2. Insert each order item
    for (const item of items) {
      await connection.execute(
        `INSERT INTO order_items (order_id, menu_id, quantity, price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.menu_id, item.quantity, item.price, item.subtotal]
      );
    }

    await connection.commit();
    return orderId;
  } catch (error) {
    // Roll back everything if any query fails
    await connection.rollback();
    throw error;
  } finally {
    // Always release the connection back to the pool
    connection.release();
  }
};

/**
 * Update the status of an order.
 * Valid statuses: Pending → Preparing → Ready → Completed
 * @param {number} orderId
 * @param {string} status
 */
export const updateOrderStatus = async (orderId, status) => {
  const [result] = await pool.execute(
    `UPDATE orders
     SET status = ?, updated_at = NOW()
     WHERE id = ?`,
    [status, orderId]
  );
  return result.affectedRows; // 1 if updated, 0 if not found
};
