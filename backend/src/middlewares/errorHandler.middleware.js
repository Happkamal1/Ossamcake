const ApiError = require("../utils/ApiError");

/**
 * Global Error Handler Middleware
 * Extracted from app.js into its own file for clarity.
 * Must be registered LAST in app.js after all routes.
 *
 * Handles:
 * - ApiError instances (operational errors)
 * - Mongoose CastError (invalid ObjectId)
 * - Mongoose ValidationError (schema validation failures)
 * - Mongoose duplicate key errors (code 11000)
 * - JWT errors
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // ── Mongoose: Invalid ObjectId ──────────────────────────────────────────────
  if (err.name === "CastError") {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  // ── Mongoose: Duplicate Field Value ─────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ApiError(409, `Duplicate value for field: ${field}`);
  }

  // ── Mongoose: Validation Error ───────────────────────────────────────────────
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, messages.join(". "));
  }

  // ── JWT: Invalid Token ───────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token. Please log in again.");
  }

  // ── JWT: Expired Token ───────────────────────────────────────────────────────
  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Your session has expired. Please log in again.");
  }

  // ── Development: full stack trace ────────────────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    return res.status(error.statusCode).json({
      success: false,
      statusCode: error.statusCode,
      message: error.message,
      errors: error.errors || [],
      stack: err.stack,
    });
  }

  // ── Production: clean response ───────────────────────────────────────────────
  res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: error.message || "Internal Server Error",
    errors: error.errors || [],
  });
};

module.exports = errorHandler;
