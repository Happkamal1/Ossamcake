const express = require("express");
const router = express.Router();
const bannerService = require("../services/admin/banner.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/v1/banners
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const banners = await bannerService.getActiveBanners();
    res.status(200).json(new ApiResponse(200, banners, "Active banners fetched successfully"));
  })
);

// GET /api/v1/banners/home
router.get(
  "/home",
  asyncHandler(async (req, res) => {
    const banners = await bannerService.getActiveBanners("home-hero");
    res.status(200).json(new ApiResponse(200, banners, "Active home hero banners fetched successfully"));
  })
);

module.exports = router;
