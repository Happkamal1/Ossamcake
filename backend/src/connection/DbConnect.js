const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: process.env.NODE_ENV !== "production",
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    const dbName = conn.connection.name;
    const host = conn.connection.host;
    const env = process.env.NODE_ENV || "development";

    // Retrieve collections registered via Mongoose models
    const collections = Object.keys(conn.connection.collections);

    console.log("\n=========================================");
    console.log("MongoDB Connected Successfully");
    console.log(`Database Name : ${dbName}`);
    console.log(`Host          : ${host}`);
    console.log(`Environment   : ${env}`);
    console.log("Collections   :");
    if (collections.length > 0) {
      collections.forEach((col) => console.log(`- ${col}`));
    } else {
      console.log("- (No collections initialized yet)");
    }
    console.log("=========================================\n");

    // Connection events for monitoring
    mongoose.connection.on("disconnected", () => {
      console.warn(`[${new Date().toISOString()}] ⚠️ MongoDB disconnected. Attempting to reconnect...`);
    });

    mongoose.connection.on("reconnected", () => {
      console.log(`[${new Date().toISOString()}] ✅ MongoDB reconnected successfully.`);
    });
    
    mongoose.connection.on("error", (err) => {
      console.error(`[${new Date().toISOString()}] ❌ MongoDB connection error:`, err);
    });

  } catch (error) {
    console.error("Database connection error:", error.message);
    throw error;
  }
};

module.exports = connectDB;