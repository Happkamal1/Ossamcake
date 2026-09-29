import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Star, Truck, Heart, Flame, ShieldCheck, Cake, Sparkles,
  ArrowRight, Loader2, Award, ShieldAlert, Sparkle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchHomeHero } from "@/features/banners/bannerSlice";

// Map dynamic icon names to Lucide icons
const ICON_MAP = {
  Star: Star,
  Truck: Truck,
  Heart: Heart,
  Flame: Flame,
  ShieldCheck: ShieldCheck,
  Cake: Cake,
  Sparkles: Sparkles,
  Fresh: Sparkle,
  Award: Award,
};

const DynamicIcon = ({ name, className }) => {
  const IconComponent = ICON_MAP[name] || Sparkles;
  return <IconComponent className={className} />;
};

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return url;
};

export default function HeroBanner() {
  const dispatch = useDispatch();
  const { heroData, loading } = useSelector((state) => state.banners);

  useEffect(() => {
    dispatch(fetchHomeHero());
  }, [dispatch]);

  if (loading) {
    return (
      <section className="relative h-[80vh] min-h-[600px] w-full bg-slate-50 flex items-center justify-center animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-pink-600 h-8 w-8" />
          <span className="text-sm font-semibold text-slate-400">Loading custom menu...</span>
        </div>
      </section>
    );
  }

  // Fallback default details if database is empty
  const hero = heroData || {
    heading: "Handcrafted Luxury in Every Slice",
    subHeading: "Experience the premium difference",
    description: "Experience the premium difference with our signature chocolate praline and organic vanilla bean creations designed by master pastry chefs.",
    desktopImage: "/public/images/cakes/ariston-signature.jpg",
    tabletImage: "/public/images/cakes/ariston-signature.jpg",
    mobileImage: "/public/images/cakes/ariston-signature.jpg",
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

  const isDark = hero.theme === "dark";

  // Card Positions mapping for right side floating cards
  const getPositionClasses = (pos) => {
    switch (pos) {
      case "top-left":
        return "top-8 -left-8 md:-left-12";
      case "top-right":
        return "top-12 -right-8 md:-right-12";
      case "bottom-left":
        return "bottom-12 -left-6 md:-left-10";
      case "bottom-right":
      default:
        return "bottom-8 -right-6 md:-right-10";
    }
  };

  const getButtonStyle = (style) => {
    if (style === "outline") return "border-2 border-primary bg-transparent hover:bg-primary hover:text-white text-primary";
    if (style === "glass") return "backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/30 text-slate-800 dark:text-white shadow-sm";
    return "bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/20";
  };

  return (
    <>
      <section
        className={`relative overflow-hidden py-12 md:py-24 lg:py-32 border-b border-border transition-all duration-700 bg-gradient-to-br ${hero.backgroundGradient} ${isDark ? "bg-slate-950 text-white dark border-slate-900" : "bg-white text-slate-800"
          }`}
      >
        {/* Floating Background Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-pink-300/10 blur-[80px] select-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-purple-300/10 blur-[100px] select-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* LEFT SIDE (Content) */}
            <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6 order-2 lg:order-1">

              {/* Offer Badge */}
              {hero.offerBadge && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-black px-4.5 py-2 rounded-full uppercase tracking-wider shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{hero.offerBadge}</span>
                </motion.div>
              )}

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-foreground drop-shadow-sm select-text"
              >
                {hero.heading}
              </motion.h1>

              {/* Subheading / Description */}
              {hero.subHeading && (
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-lg sm:text-xl font-bold text-primary tracking-wide select-text"
                >
                  {hero.subHeading}
                </motion.p>
              )}

              {hero.description && (
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl font-medium select-text"
                >
                  {hero.description}
                </motion.p>
              )}

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4 w-full sm:w-auto"
              >
                {hero.primaryButton && (
                  <Button asChild size="lg" className={`${getButtonStyle(hero.buttonStyle)} font-black px-8 py-6 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 flex-1 sm:flex-none`}>
                    <Link to={hero.primaryButtonLink || "/shop"}>
                      {hero.primaryButton} <ArrowRight className="ml-1.5 h-4.5 w-4.5" />
                    </Link>
                  </Button>
                )}
                {hero.secondaryButton && (
                  <Button asChild variant="outline" size="lg" className="border-2 border-border/80 bg-background/5 hover:bg-foreground hover:text-background font-extrabold px-8 py-6 rounded-full transition-all hover:scale-105 active:scale-95 flex-1 sm:flex-none">
                    <Link to={hero.secondaryButtonLink || "/"}>
                      {hero.secondaryButton}
                    </Link>
                  </Button>
                )}
              </motion.div>

              {/* Rating & Delivery Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pt-4 border-t border-border/50 w-full"
              >
                <div className="flex items-center gap-1.5 text-accent font-black text-sm">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-foreground ml-1">{hero.rating || "4.9"} Rated</span>
                </div>

                {hero.deliveryInfo && (
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Truck className="h-4.5 w-4.5 text-primary" />
                    <span>{hero.deliveryInfo}</span>
                  </div>
                )}
              </motion.div>

            </div>

            {/* RIGHT SIDE (Immersive cake visual) */}
            <div className="lg:col-span-6 flex items-center justify-center relative order-1 lg:order-2 py-8">

              {/* Backing decorative blobs */}
              <div className="absolute w-[80%] aspect-square rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] bg-gradient-to-tr from-primary/20 via-pink-400/5 to-purple-500/20 blur-[10px] animate-spin-slow opacity-80" />

              {/* Luxury organic cake frame */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="relative z-10 w-[75%] aspect-square"
              >
                <motion.div
                  animate={{
                    y: [0, -12, 0]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-full h-full rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] overflow-hidden border-[6px] border-background shadow-2xl shadow-primary/10 select-none"
                >
                  <picture className="w-full h-full">
                    <source media="(max-width: 640px)" srcSet={getImageUrl(hero.mobileImage)} />
                    <source media="(max-width: 1024px)" srcSet={getImageUrl(hero.tabletImage)} />
                    <img
                      src={getImageUrl(hero.desktopImage)}
                      alt={hero.heading}
                      className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-1000"
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent" />
                </motion.div>
              </motion.div>

              {/* Floating Discount Tag Overlay */}
              {hero.discountLabel && (
                <motion.div
                  initial={{ scale: 0, rotate: 10 }}
                  animate={{ scale: 1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 150, delay: 0.6 }}
                  className="absolute top-1/3 left-6 z-20 bg-accent text-accent-foreground font-black px-4 py-2 rounded-2xl shadow-xl shadow-accent/20 border border-white/20 select-none animate-bounce-slow"
                >
                  {hero.discountLabel}
                </motion.div>
              )}

              {/* Interactive Floating Cards around the cake */}
              {hero.floatingCards && hero.floatingCards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 120 }}
                  className={`absolute z-20 ${getPositionClasses(card.position)} bg-background/80 backdrop-blur-md border border-border/60 px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2 hover:scale-105 hover:-translate-y-0.5 transition-all cursor-default select-none`}
                >
                  <DynamicIcon name={card.icon} className="h-4.5 w-4.5 text-primary shrink-0" />
                  <span className="text-xs font-extrabold text-foreground tracking-wide whitespace-nowrap">{card.text}</span>
                </motion.div>
              ))}

            </div>

          </div>
        </div>
      </section>

      {/* Dynamic Trust Badges Section */}
      {hero.trustBadges && hero.trustBadges.length > 0 && (
        <section className={`py-10 border-b border-border transition-colors duration-500 ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-secondary/20 text-slate-800"
          }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {hero.trustBadges.map((badge, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3.5"
                >
                  <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm border border-primary/5">
                    <DynamicIcon name={badge.icon} className="h-5.5 w-5.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-foreground tracking-tight">{badge.label}</h4>
                    <p className="text-[11px] font-semibold text-muted-foreground leading-tight">{badge.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mobile Sticky CTA button */}
      {hero.primaryButton && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border z-50 flex items-center justify-between md:hidden shadow-2xl animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">OssamCake Promo</span>
            <span className="text-sm font-extrabold text-foreground line-clamp-1">{hero.heading}</span>
          </div>
          <Button asChild size="sm" className="bg-primary hover:bg-primary/95 text-primary-foreground font-black px-6 py-4.5 rounded-full shadow-md active:scale-95 transition-all">
            <Link to={hero.primaryButtonLink || "/shop"}>
              {hero.primaryButton}
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
