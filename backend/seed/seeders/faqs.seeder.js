const FAQ = require("../../src/models/FAQ");

const FAQS_DATA = [
  {
    question: "Do you offer eggless options for your cakes?",
    answer: "Yes! Almost all our signature cakes can be customized to be 100% eggless. Simply select the 'Eggless' toggle on the cake details page before adding it to your cart.",
    category: "Cakes & Flavors",
    order: 1,
    isActive: true,
  },
  {
    question: "How far in advance do I need to place my order?",
    answer: "For our classic cakes, a 24-hour advance order is sufficient. For multi-tiered custom wedding cakes, we recommend booking at least 3 to 7 days in advance to ensure slot availability.",
    category: "Ordering",
    order: 2,
    isActive: true,
  },
  {
    question: "Do you deliver to my location and what are the charges?",
    answer: "We deliver across the metropolitan area in temperature-controlled delivery vans. Delivery is free for all orders above ₹800. For orders under ₹800, a flat shipping fee of ₹99 is charged.",
    category: "Delivery",
    order: 3,
    isActive: true,
  },
  {
    question: "Can I customize the message or add a photo to the cake?",
    answer: "Absolutely! Every cake details page allows you to type in a custom message (e.g., 'Happy Anniversary') and upload high-resolution JPEG/PNG files for our photo-iced cakes.",
    category: "Customization",
    order: 4,
    isActive: true,
  },
];

async function seedFAQs() {
  await FAQ.deleteMany({});
  await FAQ.insertMany(FAQS_DATA);
  console.log(`  ✓ FAQs seeded (${FAQS_DATA.length} records)`);
}

async function deleteFAQs() {
  await FAQ.deleteMany({});
  console.log("  ✓ FAQs cleared");
}

module.exports = { seedFAQs, deleteFAQs };
