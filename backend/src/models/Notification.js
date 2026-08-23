const mongoose = require("mongoose");

/**
 * Notification — Master content collection.
 * Admin creates one document per notification.
 * Users receive a UserNotification reference to this document.
 *
 * Future-ready: slug field enables SEO-friendly URLs and decouples
 * frontend routing from internal MongoDB ObjectIds.
 */

// ── Slug generator helper (used inside pre-save hook) ─────────────────────────
function buildSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")   // strip special chars
    .replace(/\s+/g, "-")            // spaces → hyphens
    .replace(/-+/g, "-")             // collapse consecutive hyphens
    .slice(0, 100);                  // cap length
}

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    // ── SEO-friendly slug (auto-generated, unique) ─────────────────────────
    slug: {
      type: String,
      unique: true,
      sparse: true,   // allows null/undefined during pre-save before hook runs
      trim: true,
      lowercase: true,
      index: true,
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

    // ── Correct refs: "Cake" (not "Product") — "Order" is correct ────────
    relatedProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Cake",  default: null },
    relatedOrder:   { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },

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

// ── Pre-validate: clean empty strings from frontend forms ──────────────────────
notificationSchema.pre("validate", function (next) {
  if (this.targetRole === "") this.targetRole = null;
  if (this.buttonText === "") this.buttonText = null;
  if (this.buttonLink === "") this.buttonLink = null;
  if (this.scheduledAt && this.scheduledAt.toString() === "") this.scheduledAt = null;
  if (this.expiresAt   && this.expiresAt.toString()   === "") this.expiresAt = null;
  if (typeof next === "function") next();
});

// ── Pre-save: auto-generate unique slug from title ─────────────────────────────
notificationSchema.pre("save", async function (next) {
  // Only generate slug when title changes or slug is missing
  if (!this.isModified("title") && this.slug) return next();

  const base = buildSlug(this.title);
  let candidate = base;
  let counter   = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Check for collision (exclude self on updates)
    const conflict = await mongoose.model("Notification").findOne({
      slug: candidate,
      _id: { $ne: this._id },
    });
    if (!conflict) break;
    counter += 1;
    candidate = `${base}-${counter}`;
  }

  this.slug = candidate;
  next();
});

// ── Indexes for common query patterns ─────────────────────────────────────────
notificationSchema.index({ status: 1, scheduledAt: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

// ── Static helper: generate and ensure unique slug (used by service layer) ────
notificationSchema.statics.generateUniqueSlug = async function (title, excludeId = null) {
  const base = buildSlug(title);
  let candidate = base;
  let counter   = 1;

  while (true) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const conflict = await this.findOne(query);
    if (!conflict) return candidate;
    counter += 1;
    candidate = `${base}-${counter}`;
  }
};

module.exports = mongoose.model("Notification", notificationSchema);
