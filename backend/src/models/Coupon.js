const mongoose = require("mongoose");

/**
 * Coupon Model — Production-ready coupon system
 * Supports percentage and flat discounts with usage limits,
 * expiry dates, and a minimum order amount threshold.
 */
const couponSchema = new mongoose.Schema(
  {
    // Coupon code customers enter at checkout (e.g. "CAKE20")
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    // Human-readable label for admin dashboard
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // "percentage" = X% off, "flat" = $X off
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: [true, "Discount type is required"],
    },

    // The actual discount value (e.g. 20 for 20% or $20)
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value cannot be negative"],
    },

    // Cap on maximum discount for percentage coupons (prevents $1000 off on a $5000 order)
    maxDiscountAmount: {
      type: Number,
      default: null, // null = no cap
    },

    // Minimum cart subtotal required to apply this coupon
    minOrderAmount: {
      type: Number,
      default: 0,
    },

    // Total number of times this coupon can be used across all users
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },

    // How many times a single user can use this coupon
    perUserLimit: {
      type: Number,
      default: 1,
    },

    // Total uses across all users (incremented on each valid use)
    usedCount: {
      type: Number,
      default: 0,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
