const SiteSettings = require("../../src/models/SiteSettings");
const { DEFAULT_SETTINGS } = require("../../src/services/siteSettings.service");

async function seedSiteSettings() {
  await SiteSettings.deleteMany({});
  await SiteSettings.create({
    ...DEFAULT_SETTINGS,
    isSingleton: true,
  });
  console.log("  ✓ SiteSettings seeded (singleton configured)");
}

async function deleteSiteSettings() {
  await SiteSettings.deleteMany({});
  console.log("  ✓ SiteSettings cleared");
}

module.exports = { seedSiteSettings, deleteSiteSettings };
