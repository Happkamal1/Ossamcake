const Testimonial = require("../../src/models/Testimonial");

const TESTIMONIALS_DATA = [
  {
    name: "Aisha Rahman",
    role: "Bride",
    rating: 5,
    message: "The Elegant Pearl wedding cake was the talk of our reception! Not only was it breath-takingly beautiful, but the layers of Champagne Vanilla Bean were incredibly moist and delicious.",
    avatar: "AR",
    order: 1,
    isActive: true,
  },
  {
    name: "Liam O'Connor",
    role: "Birthday Parent",
    rating: 5,
    message: "Ordered the Custom Confetti cake for my son's 5th birthday. The design was exactly what we wanted, and it was so delicious that both kids and adults asked for seconds!",
    avatar: "LO",
    order: 2,
    isActive: true,
  },
  {
    name: "Sophia Chen",
    role: "Anniversary Host",
    rating: 5,
    message: "The Ariston Signature cake is hands down the best chocolate cake I have ever tasted in New York. The gold dust detail makes it feel so premium. Well worth every penny!",
    avatar: "SC",
    order: 3,
    isActive: true,
  },
];

async function seedTestimonials() {
  await Testimonial.deleteMany({});
  await Testimonial.insertMany(TESTIMONIALS_DATA);
  console.log(`  ✓ Testimonials seeded (${TESTIMONIALS_DATA.length} records)`);
}

async function deleteTestimonials() {
  await Testimonial.deleteMany({});
  console.log("  ✓ Testimonials cleared");
}

module.exports = { seedTestimonials, deleteTestimonials };
