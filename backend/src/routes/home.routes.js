const express = require("express");
const router = express.Router();
const bannerService = require("../services/admin/banner.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const FALLBACK_HERO = {
  heading: "Handcrafted Luxury in Every Slice",
  subHeading: "Experience the premium difference",
  description: "Experience the premium difference with our signature chocolate praline and organic vanilla bean creations designed by master pastry chefs.",
  desktopImage: "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/products/ariston-signature.jpg",
  tabletImage: "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/products/ariston-signature.jpg",
  mobileImage: "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/products/ariston-signature.jpg",
  offerBadge: "Masterpiece Collection",
  discountLabel: "Flat 20% OFF",
  primaryButton: "Order Now",
  primaryButtonLink: "/shop",
  secondaryButton: "Explore Cakes",
  secondaryButtonLink: "/shop?category=Premium Cakes",
  rating: 4.9,
  deliveryInfo: "Same Day Delivery",
  backgroundGradient: "from-pink-500/10 via-background to-purple-500/10",
  theme: "light",
  animationType: "fade",
  status: "active",
  displayOrder: 0,
  trustBadges: [
    { icon: "Fresh", label: "100% Fresh", description: "Baked fresh daily by master pastry artists" },
    { icon: "Truck", label: "Same Day Delivery", description: "Freshly delivered to your doorstep within hours" },
    { icon: "ShieldCheck", label: "Secure Payment", description: "Fully encrypted and secure checkout experience" },
    { icon: "Cake", label: "Custom Cakes", description: "Completely customizable shapes, sizing and decorations" }
  ],
  floatingCards: [
    { icon: "Star", text: "⭐ 4.9 Rating", position: "top-left" },
    { icon: "Truck", text: "🚚 Same Day Delivery", position: "top-right" },
    { icon: "Heart", text: "🎉 10,000+ Happy Customers", position: "bottom-left" },
    { icon: "Flame", text: "🔥 Best Seller", position: "bottom-right" }
  ]
};

router.get(
  "/hero",
  asyncHandler(async (req, res) => {
    const banners = await bannerService.getActiveBanners("home-hero");
    
    if (!banners || banners.length === 0) {
      return res.status(200).json(new ApiResponse(200, FALLBACK_HERO, "Fallback Home Hero fetched successfully"));
    }

    // Map the first active hero banner to the requested API response structure
    const activeHero = banners[0];
    const mappedResponse = {
      heading: activeHero.title,
      subHeading: activeHero.subtitle || "",
      description: activeHero.description || "",
      desktopImage: activeHero.desktopImage,
      tabletImage: activeHero.tabletImage || activeHero.desktopImage,
      mobileImage: activeHero.mobileImage || activeHero.desktopImage,
      offerBadge: activeHero.badge || "",
      discountLabel: activeHero.offerLabel || "",
      primaryButton: activeHero.primaryButtonText || "Order Now",
      primaryButtonLink: activeHero.primaryButtonLink || "/shop",
      secondaryButton: activeHero.secondaryButtonText || "Explore Cakes",
      secondaryButtonLink: activeHero.secondaryButtonLink || "/",
      rating: activeHero.rating || 4.9,
      deliveryInfo: activeHero.deliveryInfo || "Same Day Delivery",
      backgroundGradient: activeHero.backgroundGradient || "from-pink-500/10 via-background to-purple-500/10",
      theme: activeHero.theme || "light",
      animationType: activeHero.animationType || "fade",
      status: activeHero.status || "active",
      displayOrder: activeHero.displayOrder || 0,
      trustBadges: activeHero.trustBadges && activeHero.trustBadges.length > 0 ? activeHero.trustBadges : FALLBACK_HERO.trustBadges,
      floatingCards: activeHero.floatingCards && activeHero.floatingCards.length > 0 ? activeHero.floatingCards : FALLBACK_HERO.floatingCards
    };

    res.status(200).json(new ApiResponse(200, mappedResponse, "Active Home Hero fetched successfully"));
  })
);

module.exports = router;
