const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    flavor: { type: String, required: true, trim: true },
    size: { type: String, required: true, trim: true }, // e.g. "0.5 kg", "1 kg"
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 10, min: 0 },
    sku: { type: String, trim: true },
    status: { type: String, default: "active", enum: ["active", "inactive"] },
  },
  { _id: false }
);

const cakeSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    occasions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Occasion" }],
    cakeTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: "CakeType" }],

    basePrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 }, // percentage

    thumbnail: { type: String, trim: true },
    gallery: [{ type: String, trim: true }],

    isBestSeller: { type: Boolean, default: false },
    isTodaySpecial: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },

    egglessAvailable: { type: Boolean, default: true },
    egglessPremium: { type: Number, default: 0 },

    variants: [variantSchema],

    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },

    isSameDayDelivery: { type: Boolean, default: false },
    deliveryTimeInfo: { type: String, trim: true },

    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
      keywords: [{ type: String, trim: true }]
    },

    status: { type: String, default: "active", enum: ["active", "inactive"] }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual: Map Mongoose ID field to the slug (for frontend backward-compatibility in routing)
cakeSchema.virtual("id").get(function () {
  return this.slug;
});

// Virtual: Map Mongoose thumbnail field to 'image' (for frontend card display references)
cakeSchema.virtual("image").get(function () {
  return this.thumbnail;
});

// Virtual: Check if status is active (for backward-compatibility with isActive checks)
cakeSchema.virtual("isActive").get(function () {
  return this.status === "active";
});

// Text index for search
cakeSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Cake", cakeSchema, "products");