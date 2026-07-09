const reviewService = require("../../services/admin/review.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const MESSAGES = require("../../constants/messages");

const getAllReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getAllReviews(req.query);
  res.status(200).json(new ApiResponse(200, result, MESSAGES.REVIEWS_FETCHED));
});

const approveReview = asyncHandler(async (req, res) => {
  const status = req.body.status || "Approved";
  const review = await reviewService.updateReviewStatus(req.params.id, status);
  res.status(200).json(new ApiResponse(200, review, `Review status updated to ${status} successfully`));
});

const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.params.id);
  res.status(200).json(new ApiResponse(200, null, MESSAGES.REVIEW_DELETED));
});

module.exports = { getAllReviews, approveReview, deleteReview };
