const mongoose = require("mongoose");

/**
 * Notification — Master content collection.
 * Admin creates one document per notification.
 * Users receive a UserNotification reference to this document.
 */
const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    message: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: [
        "promotion", "offer", "coupon", "order",
        "security", "account", "system", "announcement", "custom",
      ],
      default: "announcement",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    buttonText: { type: String, trim: true, default: null },
    buttonLink:  { type: String, trim: true, default: null },
    relatedProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },

    // ── Targeting ──────────────────────────────────────────────────────────
    targetType: {
      type: String,
      enum: ["all", "specific", "multiple", "role", "new", "inactive"],
      default: "all",
    },
    targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    targetRole:  { type: String, enum: ["user", "admin", "super_admin", null], default: null },

    // ── Scheduling & Lifecycle ─────────────────────────────────────────────
    status: {
      type: String,
      enum: ["draft", "scheduled", "active", "expired", "disabled"],
      default: "draft",
    },
    scheduledAt: { type: Date, default: null },
    expiresAt:   { type: Date, default: null },
    sentAt:      { type: Date, default: null },

    // ── Audit ─────────────────────────────────────────────────────────────
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Pre-validate hook to clean up empty strings sent by frontend forms
notificationSchema.pre("validate", function (next) {
  if (this.targetRole === "") this.targetRole = null;
  if (this.buttonText === "") this.buttonText = null;
  if (this.buttonLink === "") this.buttonLink = null;
  // If date fields are empty strings, reset to null to avoid cast/validation errors
  if (this.scheduledAt && this.scheduledAt.toString() === "") this.scheduledAt = null;
  if (this.expiresAt && this.expiresAt.toString() === "") this.expiresAt = null;
  if (typeof next === "function") next();
});

// Indexes for common query patterns
notificationSchema.index({ status: 1, scheduledAt: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
