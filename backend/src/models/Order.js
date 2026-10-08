const mongoose = require("mongoose");

// Snapshot of order item — frozen at time of purchase so deletions don't break history
const orderItemSchema = new mongoose.Schema(
  {
    cake: { type: mongoose.Schema.Types.ObjectId, ref: "Cake" }, // May be null if cake deleted
    name: { type: String, required: true },   // Snapshot name
    image: { type: String, default: "" },     // Snapshot image URL

    flavor: { type: String, default: "" },
    size: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },

    isEggless: { type: Boolean, default: false },
    cakeMessage: { type: String, default: "" },
    photoUrl: { type: String, default: "" },

    deliveryDate: { type: Date },
    deliveryTimeSlot: { type: String, default: "" },

    addons: {
      candles: { type: Boolean, default: false },
      knife: { type: Boolean, default: false },
      greetingCard: { type: Boolean, default: false },
      cardMessage: { type: String, default: "" },
    },
  },
  { _id: false }
);

// Shipping address — mirrors Checkout.jsx address state
const shippingAddressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: "" },
    zip: { type: String, required: true },
    giftNote: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Human-readable ID shown in frontend: "ORD-123456"
    orderNumber: { type: String, unique: true },

    items: [orderItemSchema],
    shippingAddress: { type: shippingAddressSchema, required: true },

    paymentMethod: {
      type: String,
      default: "cod",
    },
    paymentProvider: {
      type: String,
      enum: ["razorpay", "stripe", "cod"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "authorized", "paid", "failed", "refunded", "cancelled"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "baking",
        "packed",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
        "refunded"
      ],
      default: "pending",
    },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
    stripePaymentIntentId: { type: String, default: "" },

    // Payment transaction reference
    paymentTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null
    },

    // Pricing breakdown — authoritative server calculations
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 }, // Alias for discountAmount
    couponDiscount: { type: Number, default: 0 }, // Alias for discountAmount
    deliveryCharge: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 }, // Alias for deliveryCharge
    taxAmount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 }, // Alias for taxAmount
    grandTotal: { type: Number, required: true },

    appliedCoupon: { type: String, default: "" },

    // Invoice details
    invoiceNumber: { type: String, unique: true, sparse: true },
    invoiceDate: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

orderSchema.pre("save", function () {
  if (!this.orderNumber) {
    const rand = Math.floor(100000 + Math.random() * 900000);
    this.orderNumber = `ORD-${rand}`;
  }
  // Synchronize pricing aliases
  if (this.discount === undefined || this.discount === 0) this.discount = this.discountAmount || 0;
  if (this.couponDiscount === undefined || this.couponDiscount === 0) this.couponDiscount = this.discountAmount || 0;
  if (this.shipping === undefined || this.shipping === 0) this.shipping = this.deliveryCharge || 0;
  if (this.tax === undefined || this.tax === 0) this.tax = this.taxAmount || 0;
});

module.exports = mongoose.model("Order", orderSchema);
