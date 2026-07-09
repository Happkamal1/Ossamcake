import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, BadgeCheck } from "lucide-react";

const REVIEWS = [
  {
    name: "Aisha Rahman",
    role: "Bride",
    rating: 5,
    text: "The Elegant Pearl wedding cake was the talk of our reception! Not only was it breath-takingly beautiful, but the layers of Champagne Vanilla Bean were incredibly moist and delicious.",
    avatar: "AR"
  },
  {
    name: "Liam O'Connor",
    role: "Birthday Parent",
    rating: 5,
    text: "Ordered the Custom Confetti cake for my son's 5th birthday. The design was exactly what we wanted, and it was so delicious that both kids and adults asked for seconds!",
    avatar: "LO"
  },
  {
    name: "Sophia Chen",
    role: "Anniversary Host",
    rating: 5,
    text: "The Ariston Signature cake is hands down the best chocolate cake I have ever tasted in New York. The gold dust detail makes it feel so premium. Well worth every penny!",
    avatar: "SC"
  }
];

export default function MobileTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Handle swipe gestures
  const handleDragEnd = (e, { offset, velocity }) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -100) {
      setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
    } else if (swipe > 100) {
      setCurrentIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
    }
  };

  return (
    <section className="py-16 bg-secondary/20 md:hidden overflow-hidden">
      <div className="px-4 mb-8 text-center">
        <span className="text-xs font-extrabold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          Real Stories
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight mt-3">What Guests Say</h2>
      </div>

      <div 
        className="px-6 relative h-[300px]"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-x-6 top-0 bg-card rounded-[24px] p-6 shadow-[0_10px_40px_rgb(0,0,0,0.06)] border border-border/50 flex flex-col justify-between h-[280px] cursor-grab active:cursor-grabbing"
          >
            <Quote className="absolute top-6 right-6 h-12 w-12 text-primary/5" />
            
            <div className="space-y-4">
              <div className="flex text-accent">
                {[...Array(REVIEWS[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-[15px] text-foreground/80 leading-relaxed font-medium italic relative z-10 line-clamp-4">
                "{REVIEWS[currentIndex].text}"
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-black flex items-center justify-center shadow-inner">
                {REVIEWS[currentIndex].avatar}
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm flex items-center gap-1">
                  {REVIEWS[currentIndex].name}
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                </h4>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  {REVIEWS[currentIndex].role}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Pagination indicators */}
      <div className="flex justify-center gap-2 mt-2">
        {REVIEWS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? "w-6 bg-primary" : "w-2 bg-border hover:bg-border/80"}`}
          />
        ))}
      </div>
    </section>
  );
}
