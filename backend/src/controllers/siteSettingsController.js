const siteSettingsService = require("../services/siteSettings.service");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    Get public site settings for frontend components (Header, Footer, Contact, Announcements, Shipping threshold)
 * @route   GET /api/v1/settings
 * @access  Public
 */
const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await siteSettingsService.getSiteSettings();
  
  // Return safe public settings subset
  const publicData = {
    businessName: settings.businessName || "OssamCake",
    tagline: settings.tagline || "",
    phone: settings.phone || "+1 (555) 123-4567",
    email: settings.email || "hello@ossamcake.com",
    address: settings.address || "123 Baker Street, Manhattan, New York, NY 10001",
    workingHours: settings.workingHours || "Mon - Sun: 8:00 AM - 10:00 PM",
    socialLinks: settings.socialLinks || {},
    footer: settings.footer || {},
    shipping: {
      freeShippingThreshold: settings.shipping?.freeShippingThreshold ?? 800.0,
      shippingFee: settings.shipping?.shippingFee ?? 99.0,
      taxRate: settings.shipping?.taxRate ?? 0.05,
      currencySymbol: settings.shipping?.currencySymbol || "₹",
      currencyCode: settings.shipping?.currencyCode || "INR",
    },
    announcement: {
      enabled: settings.announcement?.enabled ?? true,
      text: settings.announcement?.text || "Free delivery on orders over ₹800! Use code WELCOME10 for 10% off",
      link: settings.announcement?.link || "/offers",
    },
  };

  res.status(200).json(new ApiResponse(200, publicData, "Site settings fetched successfully"));
});

/**
 * @desc    Admin: Get all site settings
 * @route   GET /api/v1/admin/settings
 * @access  Admin
 */
const getAdminSettings = asyncHandler(async (req, res) => {
  const settings = await siteSettingsService.getSiteSettings(true);
  res.status(200).json(new ApiResponse(200, settings, "Admin site settings fetched successfully"));
});

/**
 * @desc    Admin: Update site settings
 * @route   PUT /api/v1/admin/settings
 * @access  Admin
 */
const updateAdminSettings = asyncHandler(async (req, res) => {
  const body = req.body;

  // Validate critical numeric values if provided
  if (body.shipping) {
    if (body.shipping.freeShippingThreshold !== undefined) {
      const threshold = Number(body.shipping.freeShippingThreshold);
      if (isNaN(threshold) || threshold < 0) {
        throw new ApiError(400, "Free shipping threshold must be a positive number");
      }
      body.shipping.freeShippingThreshold = threshold;
    }
    if (body.shipping.shippingFee !== undefined) {
      const fee = Number(body.shipping.shippingFee);
      if (isNaN(fee) || fee < 0) {
        throw new ApiError(400, "Shipping fee must be a positive number");
      }
      body.shipping.shippingFee = fee;
    }
    if (body.shipping.taxRate !== undefined) {
      let taxRate = Number(body.shipping.taxRate);
      // If entered as percentage like 5, convert to 0.05
      if (taxRate > 1) {
        taxRate = taxRate / 100;
      }
      if (isNaN(taxRate) || taxRate < 0 || taxRate > 1) {
        throw new ApiError(400, "Tax rate must be between 0 and 1 (or 0% to 100%)");
      }
      body.shipping.taxRate = taxRate;
    }
  }

  const updated = await siteSettingsService.updateSiteSettings(body);
  res.status(200).json(new ApiResponse(200, updated, "Site settings updated successfully"));
});

module.exports = {
  getPublicSettings,
  getAdminSettings,
  updateAdminSettings,
};
