// utils/response.js
// Standardized API response helpers.
// Using these ensures every endpoint returns a consistent JSON shape,
// making it easier for the frontend to handle responses uniformly.

/**
 * Send a success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {string} message - Human-readable message
 * @param {any} data - Payload to return
 */
export const sendSuccess = (res, statusCode = 200, message = "Success", data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {string} message - Error description
 */
export const sendError = (res, statusCode = 500, message = "Internal Server Error") => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};
