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
      enum: ["card", "cod", "upi"],
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
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned"
      ],
      default: "pending",
    },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
    
    // Payment transaction reference
    paymentTransaction: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Payment",
      default: null 
    },

    // Pricing breakdown — mirrors Checkout.jsx calculations
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    appliedCoupon: { type: String, default: "" },
    
    // Invoice details
    invoiceNumber: { type: String, unique: true, sparse: true },
    invoiceDate: { type: Date },
  },
  { timestamps: true }
);

// Auto-generate orderNumber before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const rand = Math.floor(100000 + Math.random() * 900000);
    this.orderNumber = `ORD-${rand}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
