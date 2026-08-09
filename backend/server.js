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

// Allow requests from the React frontend.
// Using a function-based origin check so we can whitelist multiple URLs
// (Vercel production, Vercel preview deployments, and local dev).
const ALLOWED_ORIGINS = [
  "https://restaurant-food-ordering-system-ten.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      // Allow server-to-server requests (no origin header) and whitelisted origins
      if (!incomingOrigin || ALLOWED_ORIGINS.includes(incomingOrigin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${incomingOrigin} is not allowed`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false, // We don't use cookies — keeping this false avoids the wildcard conflict
  })
);

// Explicitly handle preflight OPTIONS requests for all routes.
// Some clients (mobile browsers, Axios) send a preflight before every
// non-simple request. Without this, those requests get a 404.
app.options("*", cors());

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

  // ── Keep-alive ping ────────────────────────────────────────────────────────
  // Render's free tier spins down after 15 minutes of inactivity.
  // When the server is asleep it can't respond to the CORS preflight,
  // so the browser reports a CORS error even though the config is correct.
  // Pinging ourselves every 14 minutes keeps the instance awake.
  const KEEP_ALIVE_URL = "https://restaurant-food-ordering-system-yc2m.onrender.com/api/health";
  const PING_INTERVAL  = 14 * 60 * 1000; // 14 minutes in ms

  setInterval(async () => {
    try {
      const res = await fetch(KEEP_ALIVE_URL);
      console.log(`🏓 Keep-alive ping: ${res.status}`);
    } catch (err) {
      console.warn("⚠ Keep-alive ping failed:", err.message);
    }
  }, PING_INTERVAL);
};

startServer();
