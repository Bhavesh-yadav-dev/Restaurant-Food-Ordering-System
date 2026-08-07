// controllers/menuController.js
// Handles all menu-related requests.
// Customer route uses getAvailableMenuItems (only available = 1).
// Chef routes use the full set including unavailable items.

import {
  getAllMenuItems,
  getAvailableMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../models/menuModel.js";
import { sendSuccess, sendError } from "../utils/response.js";

// ─── Customer ─────────────────────────────────────────────────────────────────

/**
 * GET /api/menu
 * Returns only available items for the customer-facing menu page.
 */
export const getCustomerMenu = async (req, res, next) => {
  try {
    const items = await getAvailableMenuItems();
    return sendSuccess(res, 200, "Menu fetched successfully", items);
  } catch (error) {
    next(error);
  }
};

// ─── Chef ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/menu/all
 * Returns all items (including unavailable) for the chef dashboard.
 */
export const getAllItems = async (req, res, next) => {
  try {
    const items = await getAllMenuItems();
    return sendSuccess(res, 200, "All menu items fetched", items);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/menu
 * Create a new menu item.
 * Body: { name, description, price, image?, available? }
 */
export const addMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, image, available } = req.body;

    // --- Validation ---
    if (!name || !description || price === undefined) {
      return sendError(res, 400, "Name, description, and price are required");
    }
    if (isNaN(price) || Number(price) < 0) {
      return sendError(res, 400, "Price must be a non-negative number");
    }

    const insertId = await createMenuItem({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      image: image || null,
      available: available !== undefined ? Number(available) : 1,
    });

    // Fetch the newly created item to return it in the response
    const newItem = await getMenuItemById(insertId);
    return sendSuccess(res, 201, "Menu item created successfully", newItem);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/menu/:id
 * Update an existing menu item.
 * Body: { name, description, price, image?, available }
 */
export const editMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, available } = req.body;

    // --- Validation ---
    if (!name || !description || price === undefined || available === undefined) {
      return sendError(res, 400, "Name, description, price, and available are required");
    }
    if (isNaN(price) || Number(price) < 0) {
      return sendError(res, 400, "Price must be a non-negative number");
    }

    const affectedRows = await updateMenuItem(Number(id), {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      image: image || null,
      available: Number(available),
    });

    if (affectedRows === 0) {
      return sendError(res, 404, "Menu item not found");
    }

    const updatedItem = await getMenuItemById(Number(id));
    return sendSuccess(res, 200, "Menu item updated successfully", updatedItem);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/menu/:id
 * Delete a menu item by ID.
 */
export const removeMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const affectedRows = await deleteMenuItem(Number(id));
    if (affectedRows === 0) {
      return sendError(res, 404, "Menu item not found");
    }

    return sendSuccess(res, 200, "Menu item deleted successfully", null);
  } catch (error) {
    next(error);
  }
};
