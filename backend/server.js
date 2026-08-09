// server.js
// Entry point for the backend.
// Initializes Express, registers middleware, mounts routes,
// and starts the HTTP server after verifying the DB connection.

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { testConnection } from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

// Route imports (will be created in next steps)
import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────

// Allow requests from the React frontend (http://localhost:5173)
app.use(
  cors({
    origin: "https://restaurant-food-ordering-system-ten.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check – useful to verify the server is running
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.use("/api/auth", authRoutes);    // Chef login
app.use("/api/menu", menuRoutes);    // Menu (chef + customer)
app.use("/api/orders", orderRoutes); // Orders (chef + customer)

// ─── 404 Handler ─────────────────────────────────────────────────────────────

// Catches any request that didn't match a route above
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ────────────────────────────────────────────────────

// Must be registered AFTER all routes
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

const startServer = async () => {
  // Verify DB connection before accepting any requests
  await testConnection();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on https://restaurant-food-ordering-system-yc2m.onrender.com`);
  });
};

startServer();
