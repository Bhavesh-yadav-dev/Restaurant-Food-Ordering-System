// config/db.js
// Creates and exports a MySQL connection pool.
// A pool is better than a single connection because it handles
// multiple simultaneous requests efficiently.

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Create a connection pool using environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // Queue requests when all connections are busy
  connectionLimit: 10,      // Max number of connections in the pool
  queueLimit: 0,            // Unlimited queued requests (0 = no limit)
});

// Test the connection when the server starts
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL connected successfully");
    connection.release(); // Always release the connection back to the pool
  } catch (error) {
    console.error("❌ MySQL connection failed:", error.message);
    process.exit(1); // Stop the server if DB connection fails
  }
};

export default pool;
