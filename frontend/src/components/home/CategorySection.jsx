import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { LayoutGrid } from "lucide-react";
import { getImageUrl } from "@/lib/api";

// Fallback images used only when DB category has no image
const FALLBACK_IMAGES = {
  "Birthday Cakes": "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/categories/birthday.png",
  "Wedding Cakes": "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/categories/wedding.png",
  "Anniversary Cakes": "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/categories/anniversary.png",
  "Photo Cakes": "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/categories/photo.png",
  "Kids Cakes": "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/categories/kids.png",
  "Premium Cakes": "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/categories/premium.png",
};

const DEFAULT_FALLBACK = "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/products/ariston-signature.jpg";

// Skeleton card shown while loading
function CategorySkeleton() {
  return (
    <div className="snap-start shrink-0 w-[160px] sm:w-auto bg-card rounded-3xl overflow-hidden border border-border p-4 flex flex-col items-center animate-pulse">
      <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-secondary mx-auto mb-4" />
      <div className="h-3 w-20 bg-secondary rounded-full mb-2" />
      <div className="h-2 w-16 bg-secondary/60 rounded-full" />
    </div>
  );
}

export default function CategorySection() {
  const { categories, loading } = useSelector((state) => state.products);

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-3 mb-12"
      >
        <span className="text-xs font-extrabold text-primary uppercase tracking-widest">Sweet Offerings</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Browse by Category</h2>
        <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
      </motion.div>

      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:gap-6">
        {loading && categories.length === 0
          ? [...Array(6)].map((_, i) => <CategorySkeleton key={i} />)
          : categories.length > 0
          ? categories.map((cat, index) => {
              const imgSrc = cat.image || FALLBACK_IMAGES[cat.name] || DEFAULT_FALLBACK;
              return (
                <motion.div
                  key={cat._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07 }}
                  whileHover={{ y: -5 }}
                  className="snap-start shrink-0 w-[160px] sm:w-auto bg-card text-card-foreground rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-border p-4 transition-all flex flex-col items-center"
                >
                  <Link to={`/shop?category=${encodeURIComponent(cat.name)}`} className="space-y-4 text-center w-full">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border-2 border-primary/20 mx-auto bg-secondary flex items-center justify-center">
                      <img
                        src={getImageUrl(imgSrc)}
                        alt={cat.name}
                        className="h-full w-full object-cover hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = DEFAULT_FALLBACK; }}
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{cat.name}</h4>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          : (
            // Empty state: no categories in DB yet
            <div className="col-span-6 py-12 text-center text-muted-foreground text-sm flex flex-col items-center gap-3">
              <LayoutGrid className="h-8 w-8 text-primary/40" />
              <p>No categories configured yet. Add categories from the Admin Panel.</p>
            </div>
          )}
      </div>
    </section>
  );
}
