import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cakesData } from "@/data/cakesData";
import ProductCard from "@/components/product/ProductCard";
import {
  Sparkles,
  ShoppingBag,
  Award,
  Truck,
  Heart,
  ChevronRight,
  Star,
  Quote,
  ShieldCheck
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const HERO_SLIDES = [
  {
    title: "Handcrafted Luxury in Every Slice",
    subtitle: "Experience the premium difference with our signature chocolate praline and organic vanilla bean creations.",
    cta: "Explore Signature Menu",
    link: "/shop?category=Premium Cakes",
    image: "/images/cakes/ariston-signature.jpg",
    badge: "Masterpiece Collection"
  }
];

const CATEGORIES = [
  { name: "Birthday Cakes", image: "/images/cakes/custom-birthday.jpg", desc: "Sprinkle joy on your special day" },
  { name: "Wedding Cakes", image: "/images/cakes/wedding-elegance.jpg", desc: "Tiered perfection for your love story" },
  { name: "Anniversary Cakes", image: "/images/cakes/chocolate-truffle-delight.png", desc: "Celebrate milestones with sweetness" },
  { name: "Photo Cakes", image: "/images/cakes/custom-birthday.jpg", desc: "Print your memories on delicious icing" },
  { name: "Kids Cakes", image: "/images/cakes/fruity-berry.jpg", desc: "Fun characters and whimsical flavors" },
  { name: "Premium Cakes", image: "/images/cakes/ariston-signature.jpg", desc: "Exquisite gourmet recipes" }
];

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

const FAQS = [
  {
    q: "Do you offer eggless options for your cakes?",
    a: "Yes! Almost all our signature cakes can be customized to be 100% eggless. Simply select the 'Eggless' toggle on the cake details page before adding it to your cart."
  },
  {
    q: "How far in advance do I need to place my order?",
    a: "For our classic cakes, a 24-hour advance order is sufficient. For multi-tiered custom wedding cakes, we recommend booking at least 3 to 7 days in advance to ensure slot availability."
  },
  {
    q: "Do you deliver to my location and what are the charges?",
    a: "We deliver across the metropolitan area in temperature-controlled delivery vans. Delivery is free for all orders above $80. For orders under $80, a flat shipping fee of $5.99 is charged."
  },
  {
    q: "Can I customize the message or add a photo to the cake?",
    a: "Absolutely! Every cake details page allows you to type in a custom message (e.g., 'Happy Anniversary') and upload high-resolution JPEG/PNG files for our photo-iced cakes."
  }
];

export default function Home() {
  const bestSellers = cakesData.filter((c) => c.isBestSeller).slice(0, 4);
  const todaysSpecials = cakesData.filter((c) => c.isTodaySpecial).slice(0, 4);

  return (
    <div className="bg-[#FFF8F9] min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 lg:py-24 border-b border-pink-50 bg-gradient-to-br from-pink-50/50 via-white to-purple-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {HERO_SLIDES.map((slide, idx) => (
            <div key={idx} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6 text-left"
              >
                <div className="inline-flex items-center gap-2 bg-pink-100/60 border border-pink-200 text-pink-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{slide.badge}</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-base sm:text-lg text-gray-650 leading-relaxed max-w-xl">
                  {slide.subtitle}
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <Button asChild size="lg" className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-6 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    <Link to="/shop">
                      Order Cakes Now <ChevronRight className="ml-1 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-pink-200 text-pink-650 hover:bg-pink-50/50 font-bold px-8 py-6 rounded-full">
                    <Link to="/shop?category=Wedding Cakes">View Wedding Menu</Link>
                  </Button>
                </div>
              </motion.div>

              {/* Visual Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative mx-auto lg:ml-auto w-full max-w-lg aspect-square rounded-3xl overflow-hidden border-4 border-white shadow-2xl"
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-900/20 to-transparent" />
                
                {/* Floating promo badge */}
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-pink-100 max-w-xs">
                  <div className="h-10 w-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-sm">
                    4.9
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">Award Winning Quality</h4>
                    <p className="text-xs text-gray-500">Voted NYC's Sweetest bakery 3 years in a row.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-3 mb-12">
          <span className="text-xs font-extrabold text-pink-500 uppercase tracking-widest">Sweet Offerings</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Browse by Celebration</h2>
          <div className="h-1 w-20 bg-pink-500 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {CATEGORIES.map((cat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg border border-pink-50/50 p-4 transition-all flex flex-col items-center"
            >
              <Link to={`/shop?category=${encodeURIComponent(cat.name)}`} className="space-y-4 text-center">
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-pink-100 mx-auto bg-pink-50 flex items-center justify-center">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{cat.name}</h4>
                  <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{cat.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Brand Value Propositions */}
      <section className="bg-pink-500 py-16 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Award, title: "Artisanal Baking", desc: "Crafted by award-winning pastry chefs" },
            { icon: ShieldCheck, title: "100% Fresh", desc: "No artificial chemical preservatives" },
            { icon: Truck, title: "On-Time Shipping", desc: "Temperature-controlled prompt delivery" },
            { icon: Heart, title: "Bespoke Requests", desc: "Custom layers, photos & greeting notes" }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="space-y-3 p-4 flex flex-col items-center">
                <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-sm text-pink-100 leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-3 text-left">
            <span className="text-xs font-extrabold text-pink-500 uppercase tracking-widest">Our Favorites</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Sweet Best Sellers</h2>
            <div className="h-1 w-20 bg-pink-500 rounded-full" />
          </div>
          <Button asChild variant="link" className="text-pink-600 hover:text-pink-500 font-bold">
            <Link to="/shop">View Entire Menu →</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {bestSellers.map((cake) => (
            <ProductCard key={cake.id} cake={cake} />
          ))}
        </div>
      </section>

      {/* Today's Special Banner */}
      <section className="bg-gradient-to-br from-pink-500 to-purple-600 py-16 text-white overflow-hidden relative">
        {/* Soft background shape */}
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-white/5" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="bg-yellow-400 text-gray-900 font-extrabold px-3 py-1.5 rounded-full text-xs uppercase tracking-widest inline-block shadow-sm">
              Today's Special Deal
            </div>
            <h2 className="text-4xl font-extrabold leading-tight text-white">
              Celebrate Today with a Special Surprise!
            </h2>
            <p className="text-pink-100 text-lg leading-relaxed max-w-xl">
              Get an extra 10% off on all signature birthday and photo cakes ordered today. Treat your family to layers of premium joy.
            </p>
            <Button asChild size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-extrabold px-8 py-5 rounded-full shadow-lg">
              <Link to="/shop?category=Birthday Cakes">Browse Birthday Specials</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {todaysSpecials.slice(0, 2).map((cake) => (
              <div key={cake.id} className="bg-white rounded-3xl p-4 text-gray-800 shadow-xl border border-white/10 flex flex-col items-center text-center">
                <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-pink-100 mb-3">
                  <img src={cake.image} alt={cake.name} className="h-full w-full object-cover" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{cake.name}</h4>
                <div className="text-pink-500 font-extrabold text-sm mt-1">
                  ${(cake.basePrice * (1 - (cake.discount || 0)/100)).toFixed(2)}
                </div>
                <Button asChild size="sm" className="mt-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs px-4">
                  <Link to={`/cake/${cake.id}`}>Order Now</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-3 mb-12">
            <span className="text-xs font-extrabold text-pink-500 uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">What Our Guests Say</h2>
            <div className="h-1 w-20 bg-pink-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REVIEWS.map((review, idx) => (
              <div
                key={idx}
                className="bg-[#FFF8F9] rounded-3xl p-8 border border-pink-50 shadow-sm relative flex flex-col justify-between text-left"
              >
                <Quote className="absolute top-6 right-6 h-8 w-8 text-pink-200/50" />
                <div className="space-y-4">
                  <div className="flex text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-650 leading-relaxed italic">
                    "{review.text}"
                  </p>
                </div>
                
                <div className="flex items-center gap-3 mt-6 border-t border-pink-100/50 pt-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 text-white font-bold text-sm flex items-center justify-center shadow-inner">
                    {review.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{review.name}</h4>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-3 mb-12 text-center">
          <span className="text-xs font-extrabold text-pink-500 uppercase tracking-widest">Questions</span>
          <h2 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
          <div className="h-1 w-20 bg-pink-500 mx-auto rounded-full" />
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {FAQS.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="bg-white border border-pink-50 rounded-2xl px-6 py-1 shadow-sm overflow-hidden"
            >
              <AccordionTrigger className="text-left font-bold text-gray-800 hover:text-pink-600 hover:no-underline text-base py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-gray-500 text-sm leading-relaxed pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
