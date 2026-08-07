// controllers/authController.js
// Handles chef authentication.
// For this prototype: plain-text password comparison (no hashing, no JWT).
// The chef record must already exist in the database.

import { findChefByEmail } from "../models/chefModel.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * POST /api/auth/login
 * Body: { email, password }
 *
 * Looks up the chef by email, then compares the password directly.
 * Returns the chef's id and name on success (never return the password).
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // --- Input validation ---
    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }

    // --- Look up chef ---
    const chef = await findChefByEmail(email);
    if (!chef) {
      return sendError(res, 401, "Invalid email or password");
    }

    // --- Compare password (plain text for prototype) ---
    if (chef.password !== password) {
      return sendError(res, 401, "Invalid email or password");
    }

    // --- Success: return safe chef data (no password) ---
    return sendSuccess(res, 200, "Login successful", {
      id: chef.id,
      name: chef.name,
      email: chef.email,
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};
