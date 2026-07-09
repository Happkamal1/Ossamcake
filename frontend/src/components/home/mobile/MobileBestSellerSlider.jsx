import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Crown } from "lucide-react";

export default function MobileBestSellerSlider({ products }) {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-scroll logic
  useEffect(() => {
    if (isPaused || !scrollRef.current || !products || products.length === 0) return;

    const interval = setInterval(() => {
      const container = scrollRef.current;
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      const cardWidth = container.children[0]?.offsetWidth || 0;

      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollTo({ left: scrollLeft + cardWidth, behavior: "smooth" });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, products]);

  // Update active index based on scroll position to trigger glowing background
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.children[0]?.offsetWidth || 0;
      if (cardWidth > 0) {
        const index = Math.round(scrollLeft / cardWidth);
        setActiveIndex(index);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [products]);

  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 overflow-hidden md:hidden relative bg-background">
      {/* Dynamic Glowing Background Behind Active Card */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/20 blur-[80px] transition-opacity duration-1000"
        style={{ opacity: 1 }}
      />

      <div className="px-4 mb-6 text-center relative z-10">
        <span className="text-xs font-extrabold text-primary uppercase tracking-widest inline-flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full mb-2">
          <Crown className="h-3 w-3" /> Our Favorites
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight">Today's Best Sellers</h2>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar px-4 pb-12 gap-4 relative z-10"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {products.map((product, index) => {
          const isActive = index === activeIndex;
          
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="snap-center shrink-0 w-[85vw] max-w-[340px]"
            >
              <Link 
                to={`/cake/${product.id}`}
                className={`block rounded-[24px] p-2 transition-all duration-500 ${
                  isActive ? "bg-gradient-to-b from-primary/20 to-primary/5 shadow-2xl shadow-primary/20 scale-[1.02] border border-primary/20" : "bg-card border border-border shadow-sm scale-95 opacity-80"
                }`}
              >
                <div className="bg-card rounded-[20px] p-4 h-full flex flex-col relative overflow-hidden">
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    <div className="bg-foreground text-background text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md w-fit">
                      Bestseller
                    </div>
                    {product.discount > 0 && (
                      <div className="bg-rose-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md w-fit">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>

                  {/* Image */}
                  <div className="h-56 w-full rounded-[16px] overflow-hidden mb-5 relative">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="text-center px-2 pb-2">
                    <div className="flex items-center justify-center gap-1 text-accent mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'fill-muted/30 text-muted/30'}`} />
                      ))}
                    </div>

                    <h3 className="font-extrabold text-xl text-foreground leading-tight mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center justify-center gap-2 mb-5">
                      {product.discount > 0 && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.basePrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-2xl font-black text-primary">
                        ${(product.basePrice * (1 - (product.discount || 0)/100)).toFixed(2)}
                      </span>
                    </div>
                    
                    <button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl active:scale-95 transition-transform shadow-md shadow-primary/20">
                      View Details
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
      
      {/* Pagination dots */}
      <div className="flex justify-center gap-1.5 pb-4">
        {products.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-border"}`} 
          />
        ))}
      </div>
    </section>
  );
}
