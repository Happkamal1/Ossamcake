const Review = require("../../models/Review");
const ApiError = require("../../utils/ApiError");
const { parsePagination, parseSort, buildPaginationMeta } = require("../../utils/queryBuilder");

const getAllReviews = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);
  const sort = parseSort(query.sort, "createdAt:-1");
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  } else if (query.isApproved !== undefined) {
    filter.status = query.isApproved === "true" ? "Approved" : "Pending";
  }
  if (query.cakeId) filter.cake = query.cakeId;
  if (query.userId) filter.user = query.userId;
  if (query.rating) filter.rating = Number(query.rating);

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("user", "name email profileImage")
      .populate("cake", "name slug thumbnail")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  return { reviews, pagination: buildPaginationMeta(total, page, limit) };
};

const updateReviewStatus = async (id, status) => {
  const validStatuses = ["Pending", "Approved", "Rejected"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const review = await Review.findByIdAndUpdate(id, { status }, { new: true });
  if (!review) throw new ApiError(404, "Review not found");
  
  // Recalculate average ratings on cake after status change
  await Review.calcAverageRatings(review.cake);

  return review;
};

const deleteReview = async (id) => {
  const review = await Review.findByIdAndDelete(id);
  if (!review) throw new ApiError(404, "Review not found");
};

module.exports = { getAllReviews, updateReviewStatus, deleteReview };
