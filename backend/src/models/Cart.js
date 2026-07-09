const mongoose = require("mongoose");

// Sub-schema mirrors exactly what CakeDetails.jsx sends on addToCart()
const addonSelectionSchema = new mongoose.Schema(
  {
    candles: { type: Boolean, default: false },
    knife: { type: Boolean, default: false },
    greetingCard: { type: Boolean, default: false },
    cardMessage: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const cartItemSchema = new mongoose.Schema(
  {
    cake: { type: mongoose.Schema.Types.ObjectId, ref: "Cake", required: true },

    // Snapshot of selected options at add-to-cart time
    flavor: { type: String, trim: true },
    size: { type: String, trim: true },       // "1 kg", "2 kg" etc.
    quantity: { type: Number, default: 1, min: 1 },
    unitPrice: { type: Number, required: true },   // Final price per unit (after variant discount)
    discount: { type: Number, default: 0 },         // Percentage

    // Customization fields from CakeDetails.jsx
    isEggless: { type: Boolean, default: false },
    cakeMessage: { type: String, default: "", trim: true },
    photoUrl: { type: String, default: "" },        // Cloudinary URL after upload

    // Delivery scheduling
    deliveryDate: { type: Date },
    deliveryTimeSlot: { type: String, default: "" },

    // Selected add-ons
    addons: { type: addonSelectionSchema, default: () => ({}) },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,  // One cart per user
    },
    items: [cartItemSchema],

    // Coupon applied via /cart/coupon
    appliedCoupon: { type: String, default: "" },
    couponDiscount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
