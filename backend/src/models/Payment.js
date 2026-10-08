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

    // Provider (razorpay | stripe | cod)
    provider: {
      type: String,
      enum: ["razorpay", "stripe", "cod"],
      default: "razorpay",
      index: true,
    },

    // Provider-agnostic identifiers
    providerPaymentId: {
      type: String,
      default: "",
      index: true,
    },
    providerOrderId: {
      type: String,
      default: "",
      index: true,
    },

    // Razorpay identifiers
    razorpayOrderId: {
      type: String,
      sparse: true,
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

    // Stripe identifiers
    stripePaymentIntentId: {
      type: String,
      sparse: true,
      index: true,
    },
    stripeClientSecret: {
      type: String,
      default: "",
    },
    stripeCustomerId: {
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
      default: "", // Order number for reference
    },

    // Payment status tracking
    status: {
      type: String,
      enum: [
        "created",      // Payment order created / intent created
        "requires_payment_method",
        "requires_action",
        "processing",   // Payment processing (Stripe / Razorpay)
        "attempted",    // User opened payment modal
        "authorized",   // Payment authorized but not captured
        "captured",     // Payment successful / succeeded
        "succeeded",    // Stripe succeeded alias
        "failed",       // Payment failed
        "refunded",     // Payment refunded
        "cancelled",    // Payment cancelled by user
      ],
      default: "created",
      index: true,
    },

    // Payment method used (from Razorpay/Stripe response)
    method: {
      type: String,
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
      brand: String,
      last4: String,
      expMonth: Number,
      expYear: Number,
      funding: String,
      country: String,
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
    paidAt: Date,
    isStockReduced: {
      type: Boolean,
      default: false,
    },

    // Refund details (if applicable)
    refund: {
      refundId: String,
      razorpayRefundId: String,
      stripeRefundId: String,
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
    webhookEventId: {
      type: String,
      default: "",
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
paymentSchema.index({ provider: 1, status: 1 });

// Virtual for formatted amount
paymentSchema.virtual("formattedAmount").get(function () {
  return `${this.currency} ${(this.amount / 100).toFixed(2)}`;
});

// Instance method to check if payment is successful
paymentSchema.methods.isSuccessful = function () {
  return ["captured", "succeeded"].includes(this.status) && (this.signatureVerified || this.provider === "stripe");
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
