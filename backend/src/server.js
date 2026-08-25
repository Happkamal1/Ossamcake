require("dotenv").config();

// 1. Validate required environment variables FIRST
const requiredEnvVars = ["MONGO_URI", "PORT"];
const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingVars.length > 0) {
  console.error(`❌ ERROR: Missing required environment variables: ${missingVars.join(", ")}`);
  console.error("Please check your .env file.");
  process.exit(1);
}

const mongoose = require("mongoose");
const cron = require("node-cron");
const connectDB = require("./connection/DbConnect");

// Handle Uncaught Exceptions (Registered early, before app/winston is loaded)
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Handle Unhandled Rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const startServer = async () => {
  try {
    // 2. Connect to MongoDB BEFORE starting the server
    await connectDB();

    // 3. Initialize required services and app
    // Required here so that process.env is fully loaded and DB is connected
    const app = require("./app");
    const PORT = process.env.PORT || 5000;

    // 4. Start Express server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);

      // 5. Start cron jobs
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

    // Handle Server Errors (e.g., EADDRINUSE)
    server.on("error", (err) => {
      console.error("❌ Server error:", err.message);
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Please choose another port or kill the process using it.`);
      }
      process.exit(1);
    });

    // Graceful Shutdown for PM2 or standard termination
    process.on("SIGTERM", () => {
      console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
      server.close(() => {
        console.log("💥 Process terminated!");
        mongoose.connection.close(false, () => {
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
