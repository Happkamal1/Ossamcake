const bannerService = require("../../services/admin/banner.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const MESSAGES = require("../../constants/messages");
const storageService = require("../../utils/storage.service");
const ApiError = require("../../utils/ApiError");

const getAllBanners = asyncHandler(async (req, res) => {
  const result = await bannerService.getAllBanners(req.query);
  res.status(200).json(new ApiResponse(200, result, MESSAGES.BANNERS_FETCHED));
});

const createBanner = asyncHandler(async (req, res) => {
  const banner = await bannerService.createBanner(req.body, req.user?._id);
  res.status(201).json(new ApiResponse(201, banner, MESSAGES.BANNER_CREATED));
});

const updateBanner = asyncHandler(async (req, res) => {
  const banner = await bannerService.updateBanner(req.params.id, req.body, req.user?._id);
  res.status(200).json(new ApiResponse(200, banner, MESSAGES.BANNER_UPDATED));
});

const deleteBanner = asyncHandler(async (req, res) => {
  await bannerService.deleteBanner(req.params.id);
  res.status(200).json(new ApiResponse(200, null, MESSAGES.BANNER_DELETED));
});

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No image file uploaded");
  }
  const result = await storageService.upload(req.file, "banners");
  res.status(200).json(new ApiResponse(200, result, "Image uploaded successfully"));
});

const deleteImage = asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  if (!publicId) {
    throw new ApiError(400, "publicId parameter is required");
  }
  await storageService.delete(decodeURIComponent(publicId));
  res.status(200).json(new ApiResponse(200, null, "Image deleted successfully"));
});

module.exports = {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  uploadImage,
  deleteImage,
};
