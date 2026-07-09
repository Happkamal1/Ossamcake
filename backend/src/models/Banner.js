const mongoose = require("mongoose");

/**
 * Banner Model
 * Manages promotional banners displayed on the home page, shop page, or any other position.
 * Admin Dashboard → Banners section manages these.
 */
const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    
    // Compatibility fields
    image: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },

    // Responsive Image URLs
    desktopImage: {
      type: String,
      required: [true, "Desktop image is required"],
    },
    desktopImageId: {
      type: String,
      default: "",
    },
    tabletImage: {
      type: String,
      default: "",
    },
    tabletImageId: {
      type: String,
      default: "",
    },
    mobileImage: {
      type: String,
      default: "",
    },
    mobileImageId: {
      type: String,
      default: "",
    },

    // Action Buttons
    primaryButtonText: {
      type: String,
      default: "",
      trim: true,
    },
    primaryButtonLink: {
      type: String,
      default: "",
      trim: true,
    },
    secondaryButtonText: {
      type: String,
      default: "",
      trim: true,
    },
    secondaryButtonLink: {
      type: String,
      default: "",
      trim: true,
    },

    // Styles & Customizations
    bgOverlayColor: {
      type: String,
      default: "rgba(0, 0, 0, 0.4)",
    },
    backgroundGradient: {
      type: String,
      default: "from-pink-500/10 via-background to-purple-500/10",
    },
    textAlignment: {
      type: String,
      enum: ["left", "center", "right"],
      default: "center",
    },
    buttonStyle: {
      type: String,
      enum: ["solid", "outline", "glass"],
      default: "solid",
    },
    animationType: {
      type: String,
      enum: ["fade", "zoom", "slide", "parallax"],
      default: "fade",
    },
    theme: {
      type: String,
      default: "light",
    },

    // Extra dynamic features
    rating: {
      type: Number,
      default: 4.9,
    },
    deliveryInfo: {
      type: String,
      default: "Same Day Delivery",
    },
    trustBadges: [
      {
        icon: { type: String, default: "" },
        label: { type: String, default: "" },
        description: { type: String, default: "" }
      }
    ],
    floatingCards: [
      {
        icon: { type: String, default: "" },
        text: { type: String, default: "" },
        position: { type: String, default: "top-left" }
      }
    ],

    // Marketing Badges & Info
    badge: {
      type: String,
      default: "",
      trim: true,
    },
    offerLabel: {
      type: String,
      default: "",
      trim: true,
    },
    couponCode: {
      type: String,
      default: "",
      trim: true,
    },

    // Positions & Ordering
    position: {
      type: String,
      enum: ["home-hero", "home-banner", "shop-top", "category-page"],
      default: "home-hero",
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    priority: {
      type: Number,
      default: 0,
    },

    // Status & Scheduler
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },

    // Auditing
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Pre-save hook for legacy field compatibility
bannerSchema.pre("save", function (next) {
  if (this.desktopImage && !this.image) {
    this.image = this.desktopImage;
  }
  if (this.primaryButtonLink && !this.link) {
    this.link = this.primaryButtonLink;
  }
  // Sync status and isActive boolean for double safety
  this.isActive = this.status === "active";
  if (typeof next === "function") next();
});
// Index for efficient active banner retrieval by position & date window
bannerSchema.index({ position: 1, status: 1, displayOrder: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model("Banner", bannerSchema);
