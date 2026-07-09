const couponService = require("../../services/admin/coupon.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const MESSAGES = require("../../constants/messages");

const getAllCoupons = asyncHandler(async (req, res) => {
  const result = await couponService.getAllCoupons(req.query);
  res.status(200).json(new ApiResponse(200, result, "Coupons fetched successfully"));
});

const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await couponService.getCouponById(req.params.id);
  res.status(200).json(new ApiResponse(200, coupon, "Coupon fetched successfully"));
});

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.createCoupon(req.body);
  res.status(201).json(new ApiResponse(201, coupon, MESSAGES.COUPON_CREATED));
});

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.updateCoupon(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, coupon, MESSAGES.COUPON_UPDATED));
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.deleteCoupon(req.params.id);
  res.status(200).json(new ApiResponse(200, coupon, MESSAGES.COUPON_DELETED));
});

module.exports = { getAllCoupons, getCouponById, createCoupon, updateCoupon, deleteCoupon };
