// routes/authRoutes.js
// Chef authentication routes.
// Mounted at /api/auth in server.js

import { Router } from "express";
import { login } from "../controllers/authController.js";

const router = Router();

// POST /api/auth/login
// Chef login with email + password
router.post("/login", login);

export default router;
