import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product/ProductCard";

export default function ProductSlider({ title, subtitle, products, viewAllLink }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-3 text-left"
        >
          <span className="text-xs font-extrabold text-primary uppercase tracking-widest">{subtitle}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">{title}</h2>
          <div className="h-1 w-20 bg-primary rounded-full" />
        </motion.div>
        
        {viewAllLink && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Button asChild variant="link" className="text-primary hover:text-primary/80 font-bold p-0">
              <Link to={viewAllLink}>View Entire Menu →</Link>
            </Button>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="h-full"
          >
            <ProductCard cake={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
