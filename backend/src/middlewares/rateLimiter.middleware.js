const rateLimit = require("express-rate-limit");
const ApiError = require("../utils/ApiError");

/**
 * Rate Limiter Middleware Configurations
 *
 * Three tiers:
 * 1. authLimiter   — strict limit for login/register (prevents brute-force)
 * 2. apiLimiter    — general API limit for all routes
 * 3. adminLimiter  — moderate limit for admin API panel
 */

// Shared options factory
const makeHandler = (message) => (req, res, next) => {
  next(new ApiError(429, message));
};

/**
 * Strict limiter for auth endpoints.
 * 20 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: makeHandler("Too many login attempts. Please try again after 15 minutes."),
});

/**
 * General API limiter for all public routes.
 * 200 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: makeHandler("Too many requests from this IP, please try again later."),
});

/**
 * Admin API limiter — more lenient for dashboard operations.
 * 500 requests per 15 minutes per IP.
 */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: makeHandler("Admin API rate limit exceeded. Please slow down."),
});

module.exports = { authLimiter, apiLimiter, adminLimiter };
