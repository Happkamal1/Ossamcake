const Occasion = require("../models/Occasion");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    Get all active occasions (public listing for OccasionSection + Shop filter)
 * @route   GET /api/v1/occasions
 * @access  Public
 */
const getAllOccasions = asyncHandler(async (req, res) => {
  const occasions = await Occasion.find({ isActive: true })
    .select("name slug image displayOrder")
    .sort({ displayOrder: 1 })
    .lean();
  res.status(200).json(new ApiResponse(200, occasions, "Occasions fetched successfully"));
});

module.exports = { getAllOccasions };
