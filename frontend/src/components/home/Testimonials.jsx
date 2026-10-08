import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { fetchPublicTestimonials } from "@/features/testimonials/testimonialSlice";

const FALLBACK_REVIEWS = [
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

export default function Testimonials() {
  const dispatch = useDispatch();
  const { testimonials, loading } = useSelector((state) => state.testimonials);

  useEffect(() => {
    dispatch(fetchPublicTestimonials());
  }, [dispatch]);

  const displayReviews = (testimonials && testimonials.length > 0) ? testimonials : FALLBACK_REVIEWS;

  return (
    <section className="py-24 bg-card transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-3 mb-16"
        >
          <span className="text-xs font-extrabold text-primary uppercase tracking-widest">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">What Our Guests Say</h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
        </motion.div>

        {loading && (!testimonials || testimonials.length === 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-background/50 rounded-3xl animate-pulse border border-border" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayReviews.map((review, idx) => {
              const rating = review.rating || 5;
              const text = review.message || review.text;
              const avatar = review.avatar || (review.name ? review.name.slice(0, 2).toUpperCase() : "CU");

              return (
                <motion.div
                  key={review._id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-background rounded-3xl p-8 border border-border shadow-sm hover:shadow-lg relative flex flex-col justify-between text-left transition-shadow duration-300"
                >
                  <Quote className="absolute top-6 right-6 h-10 w-10 text-primary/10" />
                  <div className="space-y-4">
                    <div className="flex text-accent">
                      {[...Array(rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-foreground/70 leading-relaxed italic relative z-10">
                      "{text}"
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-6 border-t border-border pt-4">
                    <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-inner text-sm">
                      {avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{review.name}</h4>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase">{review.role || "Customer"}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
