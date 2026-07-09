import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function SpecialOffers({ todaysSpecials }) {
  if (!todaysSpecials || todaysSpecials.length === 0) return null;

  return (
    <section className="bg-primary py-20 text-primary-foreground overflow-hidden relative transition-colors duration-500">
      {/* Decorative shapes */}
      <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-accent/10 blur-2xl" />
      <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-accent/10 blur-2xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6 text-left"
        >
          <div className="bg-accent text-accent-foreground font-extrabold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest inline-block shadow-sm">
            Today's Special Deal
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
            Celebrate Today with a Surprise!
          </h2>
          <p className="text-primary-foreground/80 text-lg leading-relaxed max-w-xl">
            Get an extra 10% off on all signature birthday and photo cakes ordered today. Treat your family to layers of premium joy.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-extrabold px-8 py-6 rounded-full shadow-lg transition-transform hover:-translate-y-1">
            <Link to="/shop?category=Birthday Cakes">Browse Birthday Specials</Link>
          </Button>
        </motion.div>
        
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {todaysSpecials.slice(0, 2).map((cake, idx) => (
            <motion.div 
              key={cake.id} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="bg-card rounded-3xl p-4 sm:p-6 text-card-foreground shadow-xl border border-border flex flex-col items-center text-center group"
            >
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden border-4 border-background mb-4 group-hover:scale-105 transition-transform duration-500">
                <img src={cake.image} alt={cake.name} className="h-full w-full object-cover" />
              </div>
              <h4 className="font-bold text-sm sm:text-base line-clamp-1">{cake.name}</h4>
              <div className="text-primary font-extrabold text-lg mt-1">
                ${(cake.basePrice * (1 - (cake.discount || 0)/100)).toFixed(2)}
              </div>
              <Button asChild size="sm" className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-xs px-6 w-full">
                <Link to={`/cake/${cake.id}`}>Order Now</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
