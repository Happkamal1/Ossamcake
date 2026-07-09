const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    // Display name — "Birthday Cakes", "Wedding Cakes", etc.
    name: { type: String, required: true, unique: true, trim: true },

    // URL slug — "birthday-cakes" (used in Shop.jsx category filter)
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },

    // Cloudinary image URL for category card display
    image: { type: String, default: "" },

    // Controls display order on Home & Shop pages
    displayOrder: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
