const mongoose = require("mongoose");

/**
 * CakeType Model
 * Represents specialized classification of cakes (Premium, Photo, Standard, etc.)
 * Products reference cakeTypes via ObjectId array.
 */
const cakeTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Cake type name is required"],
      unique: true,
      trim: true,
    },
    // URL-friendly slug — used in filter queries
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CakeType", cakeTypeSchema, "cakeTypes");
