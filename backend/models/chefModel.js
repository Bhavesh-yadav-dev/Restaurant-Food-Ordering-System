// models/chefModel.js
// All database queries related to the chef table.
// Controllers call these functions — they never write SQL directly.

import pool from "../config/db.js";

/**
 * Find a chef by their email address.
 * Used during login to look up the chef's record.
 * @param {string} email
 * @returns {object|null} Chef row or null if not found
 */
export const findChefByEmail = async (email) => {
  const [rows] = await pool.execute(
    "SELECT * FROM chef WHERE email = ?",
    [email]
  );
  // rows is always an array; return the first match or null
  return rows.length > 0 ? rows[0] : null;
};
