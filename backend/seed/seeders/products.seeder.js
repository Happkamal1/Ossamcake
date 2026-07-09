const Cake = require("../../src/models/Cake");
const data = require("../../seed-data/products.json");

/**
 * Products Seeder
 * Seeds all 17 cake products with full normalized ObjectId references
 * to categories, occasions, and cakeTypes.
 *
 * IMPORTANT: Run AFTER categories, occasions, and cakeTypes seeders
 * so that the referenced ObjectIds already exist in their collections.
 */
async function seedProducts() {
  await Cake.deleteMany({});
  // Map Extended JSON format to plain objects mongoose can insert
  const docs = data.map((p) => ({
    ...p,
    // Replace { $oid: "..." } with plain strings — Mongoose handles ObjectId conversion
    _id: p._id?.$oid || p._id,
    categories: (p.categories || []).map((c) => c?.$oid || c),
    occasions: (p.occasions || []).map((o) => o?.$oid || o),
    cakeTypes: (p.cakeTypes || []).map((t) => t?.$oid || t),
  }));
  const inserted = await Cake.insertMany(docs, { lean: true });
  console.log(`  ✅ Products: seeded ${inserted.length} documents`);
  return inserted;
}

async function deleteProducts() {
  const result = await Cake.deleteMany({});
  console.log(`  🗑️  Products: removed ${result.deletedCount} documents`);
}

module.exports = { seedProducts, deleteProducts };
