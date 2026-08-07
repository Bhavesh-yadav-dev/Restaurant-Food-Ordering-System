// routes/menuRoutes.js
// Menu routes for both customer and chef.
// Mounted at /api/menu in server.js
//
// Route map:
//   GET    /api/menu         → customer menu (available items only)
//   GET    /api/menu/all     → chef: all items including unavailable
//   POST   /api/menu         → chef: add a new item
//   PUT    /api/menu/:id     → chef: update an item
//   DELETE /api/menu/:id     → chef: delete an item
//
// NOTE: /all must be declared BEFORE /:id so Express doesn't
// try to match the string "all" as a numeric ID parameter.

import { Router } from "express";
import {
  getCustomerMenu,
  getAllItems,
  addMenuItem,
  editMenuItem,
  removeMenuItem,
} from "../controllers/menuController.js";

const router = Router();

// ── Customer ──────────────────────────────────────────────────────────────────
router.get("/", getCustomerMenu);

// ── Chef ──────────────────────────────────────────────────────────────────────
router.get("/all", getAllItems);
router.post("/", addMenuItem);
router.put("/:id", editMenuItem);
router.delete("/:id", removeMenuItem);

export default router;
