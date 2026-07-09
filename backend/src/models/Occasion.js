const mongoose = require("mongoose");

/**
 * Occasion Model
 * Represents event-based occasions (Birthday, Anniversary, Wedding, etc.)
 * Products reference occasions via ObjectId array.
 */
const occasionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Occasion name is required"],
      unique: true,
      trim: true,
    },
    // URL-friendly slug — used in filter queries and Shop page routing
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Cloudinary or local image URL for occasion card on the frontend
    image: {
      type: String,
      default: "",
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Occasion", occasionSchema);
