const Occasion = require("../../src/models/Occasion");
const data = require("../../seed-data/occasions.json");

/**
 * Occasions Seeder
 * Seeds 4 occasions: Birthday, Anniversary, Wedding, Kids Celebration.
 */
async function seedOccasions() {
  await Occasion.deleteMany({});
  const inserted = await Occasion.insertMany(data);
  console.log(`  ✅ Occasions: seeded ${inserted.length} documents`);
  return inserted;
}

async function deleteOccasions() {
  const result = await Occasion.deleteMany({});
  console.log(`  🗑️  Occasions: removed ${result.deletedCount} documents`);
}

module.exports = { seedOccasions, deleteOccasions };
