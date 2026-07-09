const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    cake: { type: mongoose.Schema.Types.ObjectId, ref: "Cake", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Approved", // Auto-approved for smoother demo/local dev, can be toggled by Admin
    },
    images: [{ type: String }],
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent duplicate reviews — one review per user per cake
reviewSchema.index({ cake: 1, user: 1 }, { unique: true });

// Static method to recalculate average rating on Cake after each review save/delete
reviewSchema.statics.calcAverageRatings = async function (cakeId) {
  const Cake = require("./Cake");
  const stats = await this.aggregate([
    { $match: { cake: cakeId, status: "Approved" } },
    {
      $group: {
        _id: "$cake",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Cake.findByIdAndUpdate(cakeId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewsCount: stats[0].nRating,
    });
  } else {
    await Cake.findByIdAndUpdate(cakeId, { rating: 0, reviewsCount: 0 });
  }
};

// Recalculate after saving
reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.cake);
});

// Recalculate after deleting
reviewSchema.post("findOneAndDelete", function (doc) {
  if (doc) doc.constructor.calcAverageRatings(doc.cake);
});

module.exports = mongoose.model("Review", reviewSchema);
