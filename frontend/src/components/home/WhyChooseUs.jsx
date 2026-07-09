import { motion } from "framer-motion";
import { Award, ShieldCheck, Truck, Heart } from "lucide-react";

const FEATURES = [
  { icon: Award, title: "Artisanal Baking", desc: "Crafted by award-winning master pastry chefs" },
  { icon: ShieldCheck, title: "100% Fresh", desc: "Organic ingredients, no artificial chemical preservatives" },
  { icon: Truck, title: "On-Time Shipping", desc: "Temperature-controlled prompt delivery to your door" },
  { icon: Heart, title: "Bespoke Requests", desc: "Custom layers, photos & handwritten greeting notes" }
];

export default function WhyChooseUs() {
  return (
    <section className="bg-primary py-20 text-primary-foreground text-center transition-colors duration-500 relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">The OssamCake Promise</h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto font-medium">
            We don't just bake cakes; we craft edible art. Here is why thousands trust us for their celebrations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {FEATURES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-4 flex flex-col items-center"
              >
                <div className="h-16 w-16 rounded-full bg-primary-foreground/10 flex items-center justify-center border border-primary-foreground/20 backdrop-blur-sm shadow-inner">
                  <Icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-extrabold text-lg">{item.title}</h3>
                <p className="text-sm text-primary-foreground/70 leading-relaxed max-w-xs">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
