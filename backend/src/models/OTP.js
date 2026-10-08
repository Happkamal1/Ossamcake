const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["emailVerification", "passwordReset", "login2FA"],
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // Automatically delete document after 10 minutes (600 seconds)
    },
  },
  { timestamps: true }
);

// Indexes
otpSchema.index({ email: 1, type: 1 });

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;
