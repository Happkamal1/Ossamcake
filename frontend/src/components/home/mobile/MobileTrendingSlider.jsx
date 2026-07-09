import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Heart, ShoppingBag, Flame } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function MobileTrendingSlider({ products }) {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

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
        // Reached end, loop back
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollTo({ left: scrollLeft + cardWidth, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, products]);

  if (!products || products.length === 0) return null;

  const handleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to add to wishlist");
      navigate("/login");
      return;
    }
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(product);
      toast.success("Added to wishlist");
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success("Added to cart");
  };

  return (
    <section className="py-10 overflow-hidden md:hidden">
      <div className="px-4 mb-6 flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold text-primary uppercase tracking-widest flex items-center gap-1">
            <Flame className="h-3 w-3" /> Fresh Out The Oven
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight mt-1">Trending Now</h2>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pl-4 pr-12 pb-8 gap-4"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 200, damping: 20 }}
            className="snap-start shrink-0 w-[85vw] max-w-[320px]"
          >
            <Link 
              to={`/cake/${product.id}`}
              className="block bg-card rounded-[20px] p-4 border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group"
            >
              {/* Floating Wishlist Button */}
              <button 
                onClick={(e) => handleWishlist(e, product)}
                className="absolute top-4 right-4 z-20 h-8 w-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
              >
                <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-primary text-primary' : 'text-foreground/50'}`} />
              </button>

              {/* Trending Badge */}
              <div className="absolute top-4 left-4 z-20 bg-primary/90 text-primary-foreground text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm flex items-center gap-1">
                <Flame className="h-3 w-3" /> Trending
              </div>

              {/* Image */}
              <div className="h-48 w-full rounded-[14px] overflow-hidden mb-4 relative bg-secondary/20">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="space-y-1 relative z-10 bg-card">
                <div className="flex items-center gap-1 text-accent mb-2">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span className="text-xs font-bold text-foreground/80">{product.rating || "4.8"}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">({product.reviews || 124})</span>
                </div>

                <h3 className="font-bold text-base text-foreground leading-tight line-clamp-1">
                  {product.name}
                </h3>
                
                <div className="flex items-end justify-between pt-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground line-through">
                      ${(product.basePrice * 1.2).toFixed(2)}
                    </span>
                    <span className="text-lg font-black text-primary">
                      ${product.basePrice.toFixed(2)}
                    </span>
                  </div>
                  
                  <button 
                    onClick={(e) => handleAddToCart(e, product)}
                    className="h-10 px-4 bg-foreground text-background font-bold text-sm rounded-xl flex items-center gap-2 active:scale-95 transition-transform"
                  >
                    <ShoppingBag className="h-4 w-4" /> Add
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
