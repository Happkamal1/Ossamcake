const Coupon = require("../../models/Coupon");
const ApiError = require("../../utils/ApiError");
const { parsePagination, parseSort, parseSearch, buildPaginationMeta } = require("../../utils/queryBuilder");

const getAllCoupons = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);
  const sort = parseSort(query.sort, "createdAt:-1");
  const filter = {};
  if (query.status === "active") filter.isActive = true;
  else if (query.status === "inactive") filter.isActive = false;
  const searchFilter = parseSearch(query.search, ["code", "description"]);
  if (searchFilter) Object.assign(filter, searchFilter);

  const [coupons, total] = await Promise.all([
    Coupon.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Coupon.countDocuments(filter),
  ]);
  return { coupons, pagination: buildPaginationMeta(total, page, limit) };
};

const getCouponById = async (id) => {
  const coupon = await Coupon.findById(id).lean();
  if (!coupon) throw new ApiError(404, "Coupon not found");
  return coupon;
};

const createCoupon = async (data) => {
  const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
  if (existing) throw new ApiError(409, "A coupon with this code already exists");
  return await Coupon.create(data);
};

const updateCoupon = async (id, data) => {
  const coupon = await Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!coupon) throw new ApiError(404, "Coupon not found");
  return coupon;
};

const deleteCoupon = async (id) => {
  const coupon = await Coupon.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!coupon) throw new ApiError(404, "Coupon not found");
  return coupon;
};

// Validate coupon code at checkout (also used by user-facing cart API)
const validateCoupon = async (code, orderTotal) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new ApiError(404, "Coupon code is invalid or expired");

  const now = new Date();
  if (coupon.expiresAt && coupon.expiresAt < now) throw new ApiError(400, "This coupon has expired");
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, "This coupon has reached its usage limit");
  }
  if (orderTotal < coupon.minOrderAmount) {
    throw new ApiError(400, `Minimum order amount of ${coupon.minOrderAmount} required for this coupon`);
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (orderTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount) discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
  } else {
    discountAmount = Math.min(coupon.discountValue, orderTotal);
  }

  return { coupon, discountAmount: Math.round(discountAmount * 100) / 100 };
};

module.exports = { getAllCoupons, getCouponById, createCoupon, updateCoupon, deleteCoupon, validateCoupon };
