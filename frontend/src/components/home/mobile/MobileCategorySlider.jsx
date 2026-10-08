import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import { getImageUrl } from "@/lib/api";

const FALLBACK_IMAGES = {
  "Birthday Cakes": "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/categories/birthday.png",
  "Wedding Cakes": "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/categories/wedding.png",
  "Anniversary Cakes": "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/categories/anniversary.png",
  "Photo Cakes": "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/categories/photo.png",
  "Kids Cakes": "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/categories/kids.png",
  "Premium Cakes": "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/categories/premium.png",
};

const DEFAULT_FALLBACK = "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/products/ariston-signature.jpg";

function MobileCategorySkeleton() {
  return (
    <div className="snap-start shrink-0 flex flex-col items-center animate-pulse mr-4 last:mr-0">
      <div className="h-20 w-20 rounded-full bg-secondary mb-3" />
      <div className="h-2 w-16 bg-secondary rounded-full" />
    </div>
  );
}

export default function MobileCategorySlider({ categories, loading }) {
  const displayCategories = categories?.slice(0, 8) || [];

  return (
    <section className="py-8 px-4 overflow-hidden md:hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight">Categories</h2>
        <Link to="/shop" className="text-primary text-sm font-bold">See All</Link>
      </div>

      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 pb-4 gap-4">
        {loading && displayCategories.length === 0 ? (
          [...Array(6)].map((_, i) => <MobileCategorySkeleton key={i} />)
        ) : displayCategories.length > 0 ? (
          displayCategories.map((cat, index) => {
            const imgSrc = cat.image || FALLBACK_IMAGES[cat.name] || DEFAULT_FALLBACK;
            return (
              <motion.div
                key={cat._id || index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                className="snap-start shrink-0 flex flex-col items-center group w-20"
              >
                <Link to={`/shop?category=${encodeURIComponent(cat.name)}`} className="space-y-3 w-full flex flex-col items-center outline-none">
                  <div className="h-20 w-20 rounded-full overflow-hidden border border-border/50 bg-card/80 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.05)] active:scale-95 transition-transform flex items-center justify-center p-0.5 relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-transparent" />
                    <img
                      src={getImageUrl(imgSrc)}
                      alt={cat.name}
                      className="h-full w-full object-cover rounded-full z-10"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = DEFAULT_FALLBACK; }}
                    />
                  </div>
                  <h4 className="font-semibold text-[11px] leading-tight text-center text-foreground/80 group-hover:text-primary transition-colors line-clamp-2">
                    {cat.name}
                  </h4>
                </Link>
              </motion.div>
            );
          })
        ) : (
          <div className="py-6 text-center text-muted-foreground text-xs w-full flex flex-col items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-primary/40" />
            <p>No categories yet</p>
          </div>
        )}
      </div>
    </section>
  );
}
