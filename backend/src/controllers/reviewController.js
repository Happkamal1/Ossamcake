const reviewService = require("../services/reviewService");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    Get all approved reviews for a product
 * @route   GET /api/v1/products/:productId/reviews
 * @access  Public
 */
const getProductReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getProductReviews(req.params.productId, req.query);
  res.status(200).json(new ApiResponse(200, result, "Reviews fetched successfully"));
});

/**
 * @desc    Create a product review
 * @route   POST /api/v1/products/:productId/reviews
 * @access  Protected
 */
const createProductReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createProductReview(req.user._id, req.params.productId, req.body);
  res.status(201).json(new ApiResponse(201, review, "Review submitted successfully"));
});

/**
 * @desc    Update a review
 * @route   PATCH /api/v1/reviews/:reviewId
 * @access  Protected
 */
const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(req.user._id, req.params.reviewId, req.body);
  res.status(200).json(new ApiResponse(200, review, "Review updated successfully"));
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/v1/reviews/:reviewId
 * @access  Protected
 */
const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.user._id, req.params.reviewId);
  res.status(200).json(new ApiResponse(200, null, "Review deleted successfully"));
});

module.exports = {
  getProductReviews,
  createProductReview,
  updateReview,
  deleteReview,
};
