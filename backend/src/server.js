require("dotenv").config();
const mongoose = require("mongoose");
const cron = require("node-cron");
const app = require("./app");
const connectDB = require("./connection/DbConnect");

// Handle Uncaught Exceptions (Initialized)
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);

  // ── Notification Scheduler ──────────────────────────────────────────────────
  // Runs every minute to dispatch scheduled notifications and expire old ones
  const { dispatchScheduledNotifications } = require("./services/notification.service");
  cron.schedule("* * * * *", async () => {
    try {
      await dispatchScheduledNotifications();
    } catch (err) {
      console.error("[Cron] Notification dispatch error:", err.message);
    }
  });
  console.log("[Cron] Notification scheduler started (every minute)");
});

// Handle Unhandled Rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful Shutdown for PM2 or standard termination
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
