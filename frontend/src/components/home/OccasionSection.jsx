import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { Calendar, Heart, Gift, PartyPopper, Star, Cake, Sparkles, Sun } from "lucide-react";
import { getImageUrl } from "@/lib/api";

// Icon mapping for occasions that have no image in DB yet
const ICON_MAP = {
  "Valentine's Day": { icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
  "Mother's Day": { icon: Gift, color: "text-purple-500", bg: "bg-purple-500/10" },
  "Father's Day": { icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
  "Birthday": { icon: PartyPopper, color: "text-amber-500", bg: "bg-amber-500/10" },
  "Anniversary": { icon: Heart, color: "text-rose-400", bg: "bg-rose-400/10" },
  "Wedding": { icon: Sparkles, color: "text-pink-500", bg: "bg-pink-500/10" },
  "Christmas": { icon: Star, color: "text-green-500", bg: "bg-green-500/10" },
  "New Year": { icon: Sun, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  "Festivals": { icon: PartyPopper, color: "text-orange-500", bg: "bg-orange-500/10" },
};

const DEFAULT_ICON = { icon: Cake, color: "text-primary", bg: "bg-primary/10" };

function OccasionSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-3xl border border-border bg-card animate-pulse">
      <div className="h-16 w-16 rounded-full bg-secondary mb-4" />
      <div className="h-3 w-20 bg-secondary rounded-full" />
    </div>
  );
}

export default function OccasionSection() {
  const { occasions, loading } = useSelector((state) => state.products);

  // Show at most 8 occasions on the homepage
  const displayOccasions = occasions.slice(0, 8);

  return (
    <section className="py-16 bg-secondary/30 border-y border-border transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-3 mb-10"
        >
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Shop by Occasion</h2>
          <p className="text-sm text-foreground/60 max-w-lg mx-auto">
            Make every moment memorable with a perfectly themed cake for your loved ones.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
          {loading && displayOccasions.length === 0
            ? [...Array(4)].map((_, i) => <OccasionSkeleton key={i} />)
            : displayOccasions.map((occ, idx) => {
                const meta = ICON_MAP[occ.name] || DEFAULT_ICON;
                const Icon = meta.icon;

                return (
                  <motion.div
                    key={occ._id || idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <Link
                      to={`/shop?occasion=${encodeURIComponent(occ.name)}`}
                      className="flex flex-col items-center justify-center p-6 rounded-3xl border border-border bg-card shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group"
                    >
                      {occ.image ? (
                        <div className="h-16 w-16 rounded-full overflow-hidden border border-border mb-4 group-hover:scale-110 transition-transform">
                          <img
                            src={getImageUrl(occ.image)}
                            alt={occ.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        </div>
                      ) : (
                        <div className={`h-16 w-16 rounded-full ${meta.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <Icon className={`h-8 w-8 ${meta.color}`} />
                        </div>
                      )}
                      <h3 className="font-bold text-foreground text-sm sm:text-base">{occ.name}</h3>
                    </Link>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </section>
  );
}
