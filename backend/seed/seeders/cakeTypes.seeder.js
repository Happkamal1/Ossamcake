const CakeType = require("../../src/models/CakeType");
const data = require("../../seed-data/cakeTypes.json");

/**
 * CakeTypes Seeder
 * Seeds 3 cake types: Premium Cakes, Photo Cakes, Standard Cakes.
 */
async function seedCakeTypes() {
  await CakeType.deleteMany({});
  const inserted = await CakeType.insertMany(data);
  console.log(`  ✅ CakeTypes: seeded ${inserted.length} documents`);
  return inserted;
}

async function deleteCakeTypes() {
  const result = await CakeType.deleteMany({});
  console.log(`  🗑️  CakeTypes: removed ${result.deletedCount} documents`);
}

module.exports = { seedCakeTypes, deleteCakeTypes };
