import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

export default function FAQSection() {
  return (
    <section className="py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-3 mb-12 text-center"
      >
        <span className="text-xs font-extrabold text-primary uppercase tracking-widest">Questions</span>
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Frequently Asked Questions</h2>
        <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
      </motion.div>

      <Accordion type="single" collapsible className="space-y-4">
        {FAQS.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <AccordionItem
              value={`faq-${index}`}
              className="bg-card border border-border rounded-2xl px-6 py-1 shadow-sm overflow-hidden"
            >
              <AccordionTrigger className="text-left font-bold text-foreground hover:text-primary hover:no-underline text-base py-4 transition-colors">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </section>
  );
}
