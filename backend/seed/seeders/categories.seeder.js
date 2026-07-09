const Category = require("../../src/models/Category");
const data = require("../../seed-data/categories.json");

/**
 * Categories Seeder
 * Seeds 6 categories: Birthday, Wedding, Anniversary, Photo, Kids, Premium Cakes.
 */
async function seedCategories() {
  await Category.deleteMany({});
  const inserted = await Category.insertMany(data);
  console.log(`  ✅ Categories: seeded ${inserted.length} documents`);
  return inserted;
}

async function deleteCategories() {
  const result = await Category.deleteMany({});
  console.log(`  🗑️  Categories: removed ${result.deletedCount} documents`);
}

module.exports = { seedCategories, deleteCategories };
