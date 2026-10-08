const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      default: "OssamCake",
      trim: true,
    },
    tagline: {
      type: String,
      default: "Crafting Luxury Celebrations with Sweet Elegance",
      trim: true,
    },
    phone: {
      type: String,
      default: "+1 (555) 123-4567",
      trim: true,
    },
    email: {
      type: String,
      default: "hello@ossamcake.com",
      trim: true,
    },
    address: {
      type: String,
      default: "123 Baker Street, Manhattan, New York, NY 10001",
      trim: true,
    },
    workingHours: {
      type: String,
      default: "Mon - Sun: 8:00 AM - 10:00 PM",
      trim: true,
    },
    socialLinks: {
      facebook: {
        type: String,
        default: "https://facebook.com",
        trim: true,
      },
      instagram: {
        type: String,
        default: "https://instagram.com",
        trim: true,
      },
      youtube: {
        type: String,
        default: "https://youtube.com",
        trim: true,
      },
      twitter: {
        type: String,
        default: "https://twitter.com",
        trim: true,
      },
      pinterest: {
        type: String,
        default: "",
        trim: true,
      },
    },
    footer: {
      aboutText: {
        type: String,
        default: "Crafting premium luxury celebrations with sweet elegance since 2010. Every cake is hand-finished by master pastry artists.",
        trim: true,
      },
      copyrightText: {
        type: String,
        default: "OssamCake. All rights reserved.",
        trim: true,
      },
    },
    shipping: {
      freeShippingThreshold: {
        type: Number,
        default: 800.0,
        min: 0,
      },
      shippingFee: {
        type: Number,
        default: 99.0,
        min: 0,
      },
      taxRate: {
        type: Number,
        default: 0.05,
        min: 0,
        max: 1,
      },
      currencySymbol: {
        type: String,
        default: "₹",
        trim: true,
      },
      currencyCode: {
        type: String,
        default: "INR",
        trim: true,
      },
    },
    announcement: {
      enabled: {
        type: Boolean,
        default: true,
      },
      text: {
        type: String,
        default: "Free delivery on orders over ₹800! Use code WELCOME10 for 10% off",
        trim: true,
      },
      link: {
        type: String,
        default: "/offers",
        trim: true,
      },
    },
    isSingleton: {
      type: Boolean,
      default: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
