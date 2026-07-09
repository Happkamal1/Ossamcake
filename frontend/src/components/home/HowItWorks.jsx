import { motion } from "framer-motion";
import { MousePointerClick, Settings2, CreditCard, Gift } from "lucide-react";

const STEPS = [
  { icon: MousePointerClick, title: "Choose a Cake", desc: "Browse our premium collection." },
  { icon: Settings2, title: "Customize", desc: "Select flavor, weight & message." },
  { icon: CreditCard, title: "Checkout", desc: "Secure payment & scheduling." },
  { icon: Gift, title: "Celebrate", desc: "Fresh delivery to your door." }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-background transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-3 mb-16"
        >
          <span className="text-xs font-extrabold text-primary uppercase tracking-widest">Process</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">How It Works</h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
        </motion.div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-[2px] bg-border border-dashed border-t-2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className="flex flex-col items-center group"
                >
                  <div className="h-20 w-20 bg-card border-4 border-background rounded-full shadow-xl flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-8 w-8 text-primary" />
                    {/* Step Number Badge */}
                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-accent text-accent-foreground font-black text-xs rounded-full flex items-center justify-center border-2 border-background">
                      {idx + 1}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
