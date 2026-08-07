// middleware/errorHandler.js
// Global error-handling middleware for Express.
// Express recognizes a 4-argument middleware as an error handler.
// Any unhandled error thrown or passed via next(err) lands here,
// so we have one central place to log and respond to errors.

import { sendError } from "../utils/response.js";

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Log the full error stack to the server console for debugging
  console.error("❌ Unhandled Error:", err.stack || err.message);

  // Use the error's own status code if set, otherwise default to 500
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  sendError(res, statusCode, message);
};

export default errorHandler;
