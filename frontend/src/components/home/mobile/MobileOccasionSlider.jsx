import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Heart, Gift, PartyPopper, Star, Cake, Sparkles, Sun } from "lucide-react";

const ICON_MAP = {
  "Valentine's Day": { icon: Heart, gradient: "from-rose-400 to-pink-500", shadow: "shadow-rose-500/20" },
  "Mother's Day": { icon: Gift, gradient: "from-purple-400 to-fuchsia-500", shadow: "shadow-fuchsia-500/20" },
  "Father's Day": { icon: Calendar, gradient: "from-blue-400 to-indigo-500", shadow: "shadow-indigo-500/20" },
  "Birthday": { icon: PartyPopper, gradient: "from-amber-400 to-orange-500", shadow: "shadow-orange-500/20" },
  "Anniversary": { icon: Heart, gradient: "from-pink-400 to-rose-500", shadow: "shadow-pink-500/20" },
  "Wedding": { icon: Sparkles, gradient: "from-pink-300 to-purple-400", shadow: "shadow-purple-500/20" },
  "Christmas": { icon: Star, gradient: "from-emerald-400 to-teal-500", shadow: "shadow-teal-500/20" },
  "New Year": { icon: Sun, gradient: "from-yellow-400 to-amber-500", shadow: "shadow-yellow-500/20" },
  "Festivals": { icon: PartyPopper, gradient: "from-orange-400 to-red-500", shadow: "shadow-red-500/20" },
};

const DEFAULT_ICON = { icon: Cake, gradient: "from-primary/80 to-primary", shadow: "shadow-primary/20" };

function MobileOccasionSkeleton() {
  return (
    <div className="snap-start shrink-0 w-[120px] h-[140px] rounded-[20px] bg-secondary/50 animate-pulse mr-4 last:mr-0" />
  );
}

export default function MobileOccasionSlider({ occasions, loading }) {
  const displayOccasions = occasions?.slice(0, 8) || [];

  return (
    <section className="py-8 px-4 overflow-hidden md:hidden bg-secondary/30">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight">Shop by Occasion</h2>
      </div>

      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 pb-6 gap-4">
        {loading && displayOccasions.length === 0 ? (
          [...Array(5)].map((_, i) => <MobileOccasionSkeleton key={i} />)
        ) : displayOccasions.length > 0 ? (
          displayOccasions.map((occ, index) => {
            const meta = ICON_MAP[occ.name] || DEFAULT_ICON;
            const Icon = meta.icon;

            return (
              <motion.div
                key={occ._id || index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                className="snap-start shrink-0 group"
              >
                <Link
                  to={`/shop?occasion=${encodeURIComponent(occ.name)}`}
                  className={`flex flex-col items-center justify-center w-[120px] h-[140px] rounded-[20px] bg-gradient-to-br ${meta.gradient} shadow-lg ${meta.shadow} relative overflow-hidden active:scale-95 transition-transform`}
                >
                  {/* Decorative blur overlay */}
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
                  
                  {/* Background Icon (faded) */}
                  <Icon className="absolute -right-4 -bottom-4 h-20 w-20 text-white/20 -rotate-12" />
                  
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                      <Icon className="h-6 w-6 text-white drop-shadow-md" />
                    </div>
                    <h3 className="font-bold text-white text-sm text-center px-2 drop-shadow-md leading-tight">
                      {occ.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            );
          })
        ) : null}
      </div>
    </section>
  );
}
