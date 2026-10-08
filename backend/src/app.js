const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const logger = require("./config/logger");
const errorHandler = require("./middlewares/errorHandler.middleware");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const { apiLimiter, authLimiter, adminLimiter } = require("./middlewares/rateLimiter.middleware");

// Create Express app
const app = express();

// ── Trust Proxy ──────────────────────────────────────────────────────────────
// Trust the immediate first hop (Nginx reverse proxy on AWS EC2).
// Setting to 1 ensures express-rate-limit and req.ip accurately reflect the real
// client IP while preventing X-Forwarded-For header spoofing bypasses.
const trustProxySetting = process.env.TRUST_PROXY
  ? (process.env.TRUST_PROXY === "true" ? true : isNaN(Number(process.env.TRUST_PROXY)) ? process.env.TRUST_PROXY : Number(process.env.TRUST_PROXY))
  : 1;
app.set("trust proxy", trustProxySetting);

// ── Core Middlewares ─────────────────────────────────────────────────────────
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || "").split(",").map(o => o.trim()).filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      // Development mode
      if (process.env.NODE_ENV !== "production") {
        if (
          !origin || 
          origin.startsWith("http://localhost") || 
          origin.startsWith("http://127.0.0.1") || 
          allowedOrigins.includes(origin)
        ) {
          return callback(null, true);
        }
        return callback(new Error(`CORS: Origin ${origin} not allowed in development`));
      }

      // Production mode
      if (origin && allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      callback(new Error(`CORS: Origin ${origin} not allowed by production security policy`));
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(compression());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

// ── Sanitization Middleware Workaround for Express 5 ──────────────────────
// Express 5 defines req.query as a getter. This breaks middlewares like
// xss-clean and express-mongo-sanitize that attempt to reassign req.query.
app.use((req, res, next) => {
  const query = req.query;
  Object.defineProperty(req, "query", {
    value: query,
    configurable: true,
    writable: true,
    enumerable: true,
  });
  next();
});

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// ── HTTP Request Logging ──────────────────────────────────────────────────────
// Development: colorized dev format to console
// Production: streams through winston to combined.log
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined", { stream: logger.stream }));
}

// ── Static Files ─────────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  API Routes
// ════════════════════════════════════════════════════════════════════════════

// Auth — strict rate limit to prevent brute-force attacks
app.use("/api/v1/auth", authLimiter, require("./routes/auth.routes"));

// User profile, addresses, passkeys, security settings
// NOTE: corrected from /api/users (old) → /api/v1/users (versioned)
app.use("/api/v1/users", require("./routes/user.routes"));

// Public product catalog (backward compat: also mount on /api/v1/cakes)
app.use("/api/v1/products", apiLimiter, require("./routes/product.routes"));
app.use("/api/v1/cakes", apiLimiter, require("./routes/product.routes")); // backward compat alias

// Categories (public listing used by Shop.jsx filter sidebar)
app.use("/api/v1/categories", apiLimiter, require("./routes/categoryRoutes"));

// Occasions (public listing used by OccasionSection + Shop filter)
app.use("/api/v1/occasions", apiLimiter, require("./routes/occasionRoutes"));

// Cake Types (public listing used by navigation dropdowns + Shop filter)
app.use("/api/v1/cake-types", apiLimiter, require("./routes/cakeTypeRoutes"));

// Public Banners
app.use("/api/v1/banners", apiLimiter, require("./routes/banner.routes"));

// Home Hero & Configs
app.use("/api/v1/home", apiLimiter, require("./routes/home.routes"));

// Cart, Orders, Wishlist (user-facing)
app.use("/api/v1/cart", require("./routes/cart.routes"));
app.use("/api/v1/orders", require("./routes/order.routes"));
app.use("/api/v1/wishlist", require("./routes/wishlist.routes"));
app.use("/api/v1/payment", require("./routes/paymentRoutes"));
app.use("/api/v1/payments", require("./routes/paymentRoutes")); // plural alias
app.use("/api/v1/reviews", require("./routes/reviewRoutes"));

// Notifications (user-facing: my notifications, unread count, mark-read)
app.use("/api/v1/notifications", require("./routes/notification.routes"));

// Public Dynamic Content & Site Settings
app.use("/api/v1/faqs", apiLimiter, require("./routes/faq.routes"));
app.use("/api/v1/testimonials", apiLimiter, require("./routes/testimonial.routes"));
app.use("/api/v1/settings", apiLimiter, require("./routes/siteSettings.routes"));

// Admin Panel — all routes protected by protect + authorize(admin, super_admin) in the router
app.use("/api/v1/admin", adminLimiter, require("./routes/admin/index"));

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.method} ${req.originalUrl} on this server`,
  });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// Must be registered LAST
app.use(errorHandler);

module.exports = app;
