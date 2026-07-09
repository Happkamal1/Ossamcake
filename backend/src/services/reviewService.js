const Review = require("../models/Review");
const Cake = require("../models/Cake");
const ApiError = require("../utils/ApiError");

/**
 * Get approved reviews for a product
 */
const getProductReviews = async (productId, query = {}) => {
  const { page = 1, limit = 10 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ cake: productId, status: "Approved" })
      .populate("user", "name email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Review.countDocuments({ cake: productId, status: "Approved" }),
  ]);

  // Generate statistics / breakdown count
  const breakdownStats = await Review.aggregate([
    { $match: { cake: productId, status: "Approved" } },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
  ]);

  // Initialize breakdown for all 5 stars
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  breakdownStats.forEach((stat) => {
    breakdown[stat._id] = stat.count;
  });

  return {
    reviews,
    breakdown,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  };
};

/**
 * Create a new review
 */
const createProductReview = async (userId, productId, reviewData) => {
  const { rating, comment, images = [] } = reviewData;

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating is required and must be between 1 and 5 stars");
  }

  const cake = await Cake.findById(productId);
  if (!cake) throw new ApiError(404, "Cake product not found");

  // Check unique review constraint
  const existingReview = await Review.findOne({ cake: productId, user: userId });
  if (existingReview) {
    throw new ApiError(400, "You have already submitted a review for this cake product");
  }

  const review = await Review.create({
    cake: productId,
    user: userId,
    rating: Number(rating),
    comment,
    images,
    status: "Approved", // Auto-approved for development/testing, can be changed by admin
  });

  return await Review.findById(review._id).populate("user", "name email profileImage").lean();
};

/**
 * Update an existing review owned by the user
 */
const updateReview = async (userId, reviewId, updateData) => {
  const { rating, comment, images } = updateData;

  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError(404, "Review not found");

  if (review.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You do not have permission to modify this review");
  }

  if (rating !== undefined) {
    if (rating < 1 || rating > 5) throw new ApiError(400, "Rating must be between 1 and 5");
    review.rating = Number(rating);
  }
  if (comment !== undefined) review.comment = comment;
  if (images !== undefined) review.images = images;

  await review.save(); // save triggers calcAverageRatings static hook

  return await Review.findById(review._id).populate("user", "name email profileImage").lean();
};

/**
 * Delete a review owned by the user
 */
const deleteReview = async (userId, reviewId) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError(404, "Review not found");

  if (review.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You do not have permission to delete this review");
  }

  // findOneAndDelete hook automatically triggers recalculation
  await Review.findOneAndDelete({ _id: reviewId });
  return true;
};

module.exports = {
  getProductReviews,
  createProductReview,
  updateReview,
  deleteReview,
};
