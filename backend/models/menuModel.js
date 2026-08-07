// models/menuModel.js
// All database queries related to the menu table.

import pool from "../config/db.js";

/**
 * Get all menu items.
 * Ordered by created_at so newest items appear last.
 */
export const getAllMenuItems = async () => {
  const [rows] = await pool.execute(
    "SELECT * FROM menu ORDER BY created_at ASC"
  );
  return rows;
};

/**
 * Get only available menu items.
 * Used on the customer-facing menu page.
 */
export const getAvailableMenuItems = async () => {
  const [rows] = await pool.execute(
    "SELECT * FROM menu WHERE available = 1 ORDER BY created_at ASC"
  );
  return rows;
};

/**
 * Get a single menu item by ID.
 * @param {number} id
 */
export const getMenuItemById = async (id) => {
  const [rows] = await pool.execute(
    "SELECT * FROM menu WHERE id = ?",
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Create a new menu item.
 * @param {object} item - { name, description, price, image, available }
 * @returns {number} insertId of the new row
 */
export const createMenuItem = async ({ name, description, price, image, available }) => {
  const [result] = await pool.execute(
    `INSERT INTO menu (name, description, price, image, available)
     VALUES (?, ?, ?, ?, ?)`,
    [name, description, price, image || null, available ?? 1]
  );
  return result.insertId;
};

/**
 * Update an existing menu item.
 * Only updates fields that are provided (non-undefined).
 * @param {number} id
 * @param {object} fields - Any subset of { name, description, price, image, available }
 */
export const updateMenuItem = async (id, { name, description, price, image, available }) => {
  const [result] = await pool.execute(
    `UPDATE menu
     SET name = ?, description = ?, price = ?, image = ?, available = ?, updated_at = NOW()
     WHERE id = ?`,
    [name, description, price, image || null, available, id]
  );
  return result.affectedRows; // 1 if updated, 0 if not found
};

/**
 * Delete a menu item by ID.
 * @param {number} id
 */
export const deleteMenuItem = async (id) => {
  const [result] = await pool.execute(
    "DELETE FROM menu WHERE id = ?",
    [id]
  );
  return result.affectedRows; // 1 if deleted, 0 if not found
};
