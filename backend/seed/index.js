/**
 * Seed Orchestrator
 * Connects to MongoDB Atlas and runs all seeders in dependency order.
 *
 * Usage:
 *   npm run seed         → seed all collections
 *   npm run seed:delete  → delete all seeded collections
 *
 * Order matters:
 *   1. categories   (no dependencies)
 *   2. occasions    (no dependencies)
 *   3. cakeTypes    (no dependencies)
 *   4. products     (references categories, occasions, cakeTypes)
 */

require("dotenv").config();
const mongoose = require("mongoose");

const { seedCategories, deleteCategories } = require("./seeders/categories.seeder");
const { seedOccasions, deleteOccasions } = require("./seeders/occasions.seeder");
const { seedCakeTypes, deleteCakeTypes } = require("./seeders/cakeTypes.seeder");
const { seedProducts, deleteProducts } = require("./seeders/products.seeder");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env");
  process.exit(1);
}

async function connectDB() {
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log(`\n🗄️  Connected to MongoDB: ${mongoose.connection.host}\n`);
}

async function runSeed() {
  try {
    await connectDB();
    console.log("🌱 Starting seed process...\n");

    // Seed in dependency order
    await seedCategories();
    await seedOccasions();
    await seedCakeTypes();
    await seedProducts();

    console.log("\n✅ All collections seeded successfully!\n");
  } catch (err) {
    console.error("\n❌ Seeding failed:", err.message);
    if (process.env.NODE_ENV !== "production") {
      console.error(err.stack);
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
    process.exit(0);
  }
}

async function runDelete() {
  try {
    await connectDB();
    console.log("🗑️  Starting delete process...\n");

    // Delete in reverse dependency order
    await deleteProducts();
    await deleteCakeTypes();
    await deleteOccasions();
    await deleteCategories();

    console.log("\n✅ All seeded collections cleared!\n");
  } catch (err) {
    console.error("\n❌ Delete failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
    process.exit(0);
  }
}

// ── CLI Entry Point ───────────────────────────────────────────────────────────
const arg = process.argv[2];

if (arg === "--seed") {
  runSeed();
} else if (arg === "--delete") {
  runDelete();
} else {
  console.log("Usage:");
  console.log("  npm run seed         → seed all collections");
  console.log("  npm run seed:delete  → delete all seeded collections");
  process.exit(0);
}
