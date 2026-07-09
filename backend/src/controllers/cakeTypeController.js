const CakeType = require("../models/CakeType");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    Get all active cake types (public listing for navigation + Shop filter)
 * @route   GET /api/v1/cake-types
 * @access  Public
 */
const getAllCakeTypes = asyncHandler(async (req, res) => {
  const cakeTypes = await CakeType.find({ isActive: true })
    .select("name slug description")
    .sort({ name: 1 })
    .lean();
  res.status(200).json(new ApiResponse(200, cakeTypes, "Cake types fetched successfully"));
});

module.exports = { getAllCakeTypes };
