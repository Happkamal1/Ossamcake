import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { getImageUrl } from "@/lib/api";

// Gallery images loaded from S3
const GALLERY = [
  "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/products/chocolate-truffle-delight.png",
  "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/products/custom-birthday.jpg",
  "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/products/fruity-berry.jpg",
  "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/products/wedding-elegance.jpg",
  "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/products/ariston-signature.jpg",
  "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/products/red-velvet.jpg"
];

export default function InstagramGallery() {
  return (
    <section className="py-20 bg-background transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-3 mb-12"
        >
          <div className="flex justify-center mb-2">
            <Instagram className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Follow Our Sweet Journey</h2>
          <p className="text-sm text-foreground/60 max-w-lg mx-auto">
            Tag @OssamCake on Instagram for a chance to be featured on our page!
          </p>
        </motion.div>

        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-3 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
          {GALLERY.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="snap-start shrink-0 w-[220px] sm:w-auto relative aspect-square overflow-hidden rounded-2xl group cursor-pointer"
            >
              <img 
                src={getImageUrl(img)} 
                alt={`Instagram gallery ${idx + 1}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                <Instagram className="h-8 w-8 text-primary-foreground" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
