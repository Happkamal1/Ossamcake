import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { fetchPublicFaqs } from "@/features/faqs/faqSlice";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FALLBACK_FAQS = [
  {
    question: "Do you offer eggless options for your cakes?",
    answer: "Yes! Almost all our signature cakes can be customized to be 100% eggless. Simply select the 'Eggless' toggle on the cake details page before adding it to your cart."
  },
  {
    question: "How far in advance do I need to place my order?",
    answer: "For our classic cakes, a 24-hour advance order is sufficient. For multi-tiered custom wedding cakes, we recommend booking at least 3 to 7 days in advance to ensure slot availability."
  },
  {
    question: "Do you deliver to my location and what are the charges?",
    answer: "We deliver across the metropolitan area in temperature-controlled delivery vans. Delivery is free for all orders above ₹800. For orders under ₹800, a flat shipping fee of ₹99 is charged."
  },
  {
    question: "Can I customize the message or add a photo to the cake?",
    answer: "Absolutely! Every cake details page allows you to type in a custom message (e.g., 'Happy Anniversary') and upload high-resolution JPEG/PNG files for our photo-iced cakes."
  }
];

export default function FAQSection() {
  const dispatch = useDispatch();
  const { faqs, loading } = useSelector((state) => state.faqs);

  useEffect(() => {
    dispatch(fetchPublicFaqs());
  }, [dispatch]);

  const displayFaqs = (faqs && faqs.length > 0) ? faqs : FALLBACK_FAQS;

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

      {loading && (!faqs || faqs.length === 0) ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 bg-card/60 animate-pulse rounded-2xl border border-border/50"
            />
          ))}
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {displayFaqs.map((faq, index) => {
            const questionText = faq.question || faq.q;
            const answerText = faq.answer || faq.a;

            return (
              <motion.div
                key={faq._id || index}
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
                    {questionText}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                    {answerText}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            );
          })}
        </Accordion>
      )}
    </section>
  );
}
