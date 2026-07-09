const mongoose = require("mongoose");

/**
 * Payment Model - Comprehensive payment tracking
 * Stores all payment attempts, successes, and failures
 */
const paymentSchema = new mongoose.Schema(
  {
    // References
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    // Razorpay identifiers
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: "",
      index: true,
    },
    razorpaySignature: {
      type: String,
      default: "",
    },

    // Payment details
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    receipt: {
      type: String,
      required: true, // Order number for reference
    },

    // Payment status tracking
    status: {
      type: String,
      enum: [
        "created",      // Payment order created
        "attempted",    // User opened payment modal
        "authorized",   // Payment authorized but not captured
        "captured",     // Payment successful
        "failed",       // Payment failed
        "refunded",     // Payment refunded
        "cancelled",    // Payment cancelled by user
      ],
      default: "created",
      index: true,
    },

    // Payment method used (from Razorpay response)
    method: {
      type: String,
      enum: ["card", "netbanking", "wallet", "upi", "emi", "cardless_emi", "paylater", "cod"],
      default: null,
    },

    // Additional payment information
    paymentMetadata: {
      card_id: String,
      bank: String,
      wallet: String,
      vpa: String, // UPI Virtual Payment Address
      email: String,
      contact: String,
      cardNetwork: String, // Visa, Mastercard, etc.
      cardType: String, // credit, debit
    },

    // Error tracking for failed payments
    errorCode: String,
    errorDescription: String,
    errorSource: String,
    errorStep: String,
    errorReason: String,

    // Verification details
    signatureVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,

    // Refund details (if applicable)
    refund: {
      razorpayRefundId: String,
      amount: Number,
      status: String,
      reason: String,
      initiatedAt: Date,
      processedAt: Date,
    },

    // Webhook tracking
    webhookReceived: {
      type: Boolean,
      default: false,
    },
    webhookData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Attempt tracking (for retries)
    attemptCount: {
      type: Number,
      default: 1,
    },

    // Notes and metadata
    notes: {
      type: Map,
      of: String,
    },

    // IP and device information (for fraud detection)
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// Virtual for formatted amount
paymentSchema.virtual("formattedAmount").get(function () {
  return `${this.currency} ${(this.amount / 100).toFixed(2)}`;
});

// Instance method to check if payment is successful
paymentSchema.methods.isSuccessful = function () {
  return this.status === "captured" && this.signatureVerified;
};

// Instance method to check if payment can be retried
paymentSchema.methods.canRetry = function () {
  return ["failed", "cancelled"].includes(this.status) && this.attemptCount < 3;
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);
};

module.exports = mongoose.model("Payment", paymentSchema);
