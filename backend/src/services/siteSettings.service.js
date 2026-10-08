const mongoose = require("mongoose");
const SiteSettings = require("../models/SiteSettings");

// Default initial settings fallback
const DEFAULT_SETTINGS = {
  businessName: "OssamCake",
  tagline: "Crafting Luxury Celebrations with Sweet Elegance",
  phone: "+1 (555) 123-4567",
  email: "hello@ossamcake.com",
  address: "123 Baker Street, Manhattan, New York, NY 10001",
  workingHours: "Mon - Sun: 8:00 AM - 10:00 PM",
  socialLinks: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    twitter: "https://twitter.com",
    pinterest: "",
  },
  footer: {
    aboutText: "Crafting premium luxury celebrations with sweet elegance since 2010. Every cake is hand-finished by master pastry artists.",
    copyrightText: "OssamCake. All rights reserved.",
  },
  shipping: {
    freeShippingThreshold: 800.0,
    shippingFee: 99.0,
    taxRate: 0.05,
    currencySymbol: "₹",
    currencyCode: "INR",
  },
  announcement: {
    enabled: true,
    text: "Free delivery on orders over ₹800! Use code WELCOME10 for 10% off",
    link: "/offers",
  },
};

let cachedSettings = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds cache for fast access during checkout & rendering

/**
 * Get the singleton site settings from DB or auto-initialize if not yet created.
 */
const getSiteSettings = async (bypassCache = false) => {
  const now = Date.now();
  if (!bypassCache && cachedSettings && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedSettings;
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      return cachedSettings || DEFAULT_SETTINGS;
    }
    let settings = await SiteSettings.findOne({ isSingleton: true });
    if (!settings) {
      settings = await SiteSettings.create({
        ...DEFAULT_SETTINGS,
        isSingleton: true,
      });
    }
    cachedSettings = settings.toObject ? settings.toObject() : settings;
    lastFetchTime = Date.now();
    return cachedSettings;
  } catch (err) {
    console.error("Failed to load SiteSettings from DB, using defaults:", err.message);
    return cachedSettings || DEFAULT_SETTINGS;
  }
};

/**
 * Update the singleton site settings.
 */
const updateSiteSettings = async (updateData) => {
  let settings = await SiteSettings.findOne({ isSingleton: true });
  if (!settings) {
    settings = new SiteSettings({ isSingleton: true });
  }

  if (updateData.businessName !== undefined) settings.businessName = updateData.businessName;
  if (updateData.tagline !== undefined) settings.tagline = updateData.tagline;
  if (updateData.phone !== undefined) settings.phone = updateData.phone;
  if (updateData.email !== undefined) settings.email = updateData.email;
  if (updateData.address !== undefined) settings.address = updateData.address;
  if (updateData.workingHours !== undefined) settings.workingHours = updateData.workingHours;

  if (updateData.socialLinks) {
    settings.socialLinks = {
      ...settings.socialLinks.toObject?.() || settings.socialLinks || {},
      ...updateData.socialLinks,
    };
  }

  if (updateData.footer) {
    settings.footer = {
      ...settings.footer.toObject?.() || settings.footer || {},
      ...updateData.footer,
    };
  }

  if (updateData.shipping) {
    settings.shipping = {
      ...settings.shipping.toObject?.() || settings.shipping || {},
      ...updateData.shipping,
    };
  }

  if (updateData.announcement) {
    settings.announcement = {
      ...settings.announcement.toObject?.() || settings.announcement || {},
      ...updateData.announcement,
    };
  }

  await settings.save();
  cachedSettings = settings.toObject ? settings.toObject() : settings;
  lastFetchTime = Date.now();
  return cachedSettings;
};

/**
 * Synchronous getter that returns the cached settings or fallback defaults immediately
 */
const getSiteSettingsSync = () => {
  return cachedSettings || DEFAULT_SETTINGS;
};

// Pre-warm the cache on server startup
getSiteSettings().catch(() => {});

module.exports = {
  getSiteSettings,
  getSiteSettingsSync,
  updateSiteSettings,
  DEFAULT_SETTINGS,
};
