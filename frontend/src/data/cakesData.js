export const cakesData = [
  {
    id: "ariston-signature",
    name: "Ariston Premium Signature Cake",
    description: "Our crowning achievement. Layers of delicate gold-dusted chocolate ganache, infused with hazelnut praline and premium Madagascar vanilla cream.",
    categories: ["Premium Cakes", "Anniversary Cakes", "Birthday Cakes"],
    basePrice: 59.99,
    rating: 4.9,
    reviewsCount: 142,
    image: "/images/cakes/ariston-signature.jpg",
    isBestSeller: true,
    isTodaySpecial: true,
    variants: [
      { flavor: "Hazelnut Chocolate Praline", size: "1 kg", price: 59.99, stock: 8 },
      { flavor: "Hazelnut Chocolate Praline", size: "2 kg", price: 109.99, stock: 5 },
      { flavor: "Madagascar Vanilla Bean", size: "1 kg", price: 54.99, stock: 12 }
    ],
    discount: 10
  },
  {
    id: "chocolate-truffle-delight",
    name: "Luxury Chocolate Truffle Delight",
    description: "Indulgent and rich dark chocolate cake layered with silky chocolate truffle ganache and topped with hand-rolled dark chocolate truffles.",
    categories: ["Premium Cakes", "Anniversary Cakes"],
    basePrice: 48.00,
    rating: 4.8,
    reviewsCount: 98,
    image: "/images/cakes/chocolate-truffle-delight.png",
    isBestSeller: true,
    isTodaySpecial: false,
    variants: [
      { flavor: "Classic Dark Chocolate", size: "0.5 kg", price: 28.00, stock: 15 },
      { flavor: "Classic Dark Chocolate", size: "1 kg", price: 48.00, stock: 20 },
      { flavor: "Dark Chocolate & Salted Caramel", size: "1 kg", price: 52.00, stock: 10 }
    ],
    discount: 15
  },
  {
    id: "black-forest",
    name: "Traditional Black Forest Gateau",
    description: "Classic German Black Forest with fluffy chocolate sponge layers, whipped cream frosting, cherry compote, and premium chocolate shavings.",
    categories: ["Birthday Cakes", "Premium Cakes"],
    basePrice: 34.99,
    rating: 4.7,
    reviewsCount: 215,
    image: "/images/cakes/black-forest.jpg",
    isBestSeller: false,
    isTodaySpecial: false,
    variants: [
      { flavor: "Classic Cherry & Chocolate", size: "0.5 kg", price: 22.99, stock: 25 },
      { flavor: "Classic Cherry & Chocolate", size: "1 kg", price: 34.99, stock: 30 }
    ],
    discount: 0
  },
  {
    id: "chocolate-fudge",
    name: "Double Chocolate Fudge Overload",
    description: "Moist chocolate sponge smothered in velvety hot fudge frosting. The ultimate cake for serious chocolate lovers.",
    categories: ["Birthday Cakes", "Kids Cakes"],
    basePrice: 39.99,
    rating: 4.9,
    reviewsCount: 184,
    image: "/images/cakes/chocolate-fudge.jpg",
    isBestSeller: true,
    isTodaySpecial: false,
    variants: [
      { flavor: "Double Chocolate Fudge", size: "0.5 kg", price: 25.99, stock: 18 },
      { flavor: "Double Chocolate Fudge", size: "1 kg", price: 39.99, stock: 22 },
      { flavor: "Chocolate Fudge Mint", size: "1 kg", price: 42.99, stock: 8 }
    ],
    discount: 5
  },
  {
    id: "custom-birthday",
    name: "Custom Confetti Birthday Special",
    description: "A celebration of colors! Soft vanilla sponge loaded with colorful sprinkles, layered with sweet buttercream and decorated with custom piping.",
    categories: ["Birthday Cakes", "Kids Cakes", "Photo Cakes"],
    basePrice: 42.50,
    rating: 4.8,
    reviewsCount: 310,
    image: "/images/cakes/custom-birthday.jpg",
    isBestSeller: true,
    isTodaySpecial: true,
    variants: [
      { flavor: "Classic Vanilla Buttercream", size: "1 kg", price: 42.50, stock: 12 },
      { flavor: "Funfetti Strawberry", size: "1 kg", price: 45.00, stock: 14 }
    ],
    discount: 10
  },
  {
    id: "fruity-delight",
    name: "Fresh Tropical Fruit Medley",
    description: "Light chiffon cake filled with fresh kiwi, pineapple, and strawberries, frosted with organic low-fat whipped cream.",
    categories: ["Birthday Cakes", "Anniversary Cakes"],
    basePrice: 38.00,
    rating: 4.6,
    reviewsCount: 88,
    image: "/images/cakes/fruity-delight.jpg",
    isBestSeller: false,
    isTodaySpecial: false,
    variants: [
      { flavor: "Tropical Fresh Fruit", size: "0.5 kg", price: 24.00, stock: 10 },
      { flavor: "Tropical Fresh Fruit", size: "1 kg", price: 38.00, stock: 15 }
    ],
    discount: 8
  },
  {
    id: "fruity-berry",
    name: "Summer Berry Chantilly Cream",
    description: "Fluffy sponge cake loaded with fresh raspberries, blueberries, and blackberries, layered with premium French Chantilly cream.",
    categories: ["Kids Cakes", "Birthday Cakes"],
    basePrice: 44.99,
    rating: 4.9,
    reviewsCount: 76,
    image: "/images/cakes/fruity-berry.jpg",
    isBestSeller: false,
    isTodaySpecial: false,
    variants: [
      { flavor: "Berry Chantilly", size: "1 kg", price: 44.99, stock: 12 }
    ],
    discount: 12
  },
  {
    id: "fruity-mango",
    name: "Alphonso Mango Dream Cake",
    description: "Seasonal specialty featuring layers of luscious fresh Alphonso mango cream, pure mango pulp compote, and pillowy vanilla sponge cake.",
    categories: ["Birthday Cakes", "Kids Cakes"],
    basePrice: 37.50,
    rating: 4.8,
    reviewsCount: 120,
    image: "/images/cakes/fruity-mango.jpg",
    isBestSeller: false,
    isTodaySpecial: true,
    variants: [
      { flavor: "Alphonso Mango Cream", size: "0.5 kg", price: 23.50, stock: 20 },
      { flavor: "Alphonso Mango Cream", size: "1 kg", price: 37.50, stock: 25 }
    ],
    discount: 0
  },
  {
    id: "fruity-passion",
    name: "Passionfruit & White Chocolate Mousse",
    description: "Exquisite combination of tangy passionfruit glaze, rich Belgian white chocolate mousse, and almond dacquoise base.",
    categories: ["Premium Cakes", "Anniversary Cakes"],
    basePrice: 52.00,
    rating: 4.7,
    reviewsCount: 65,
    image: "/images/cakes/fruity-passion.jpg",
    isBestSeller: false,
    isTodaySpecial: false,
    variants: [
      { flavor: "White Chocolate Passionfruit", size: "1 kg", price: 52.00, stock: 10 }
    ],
    discount: 15
  },
  {
    id: "lemon-strawberry",
    name: "Lemon Zest Strawberry Bliss",
    description: "Zesty lemon sponge cake filled with home-cooked sweet strawberry jam and iced with lemon-scented cream cheese frosting.",
    categories: ["Birthday Cakes"],
    basePrice: 35.00,
    rating: 4.5,
    reviewsCount: 112,
    image: "/images/cakes/lemon-strawberry.jpg",
    isBestSeller: false,
    isTodaySpecial: false,
    variants: [
      { flavor: "Lemon Strawberry Cream", size: "1 kg", price: 35.00, stock: 15 }
    ],
    discount: 0
  },
  {
    id: "red-velvet",
    name: "Royal Red Velvet Passion",
    description: "Authentic deep-red velvet sponge layers with a touch of premium cocoa, frosted with our signature smooth whipped cream cheese frosting.",
    categories: ["Anniversary Cakes", "Wedding Cakes", "Premium Cakes"],
    basePrice: 45.00,
    rating: 4.9,
    reviewsCount: 280,
    image: "/images/cakes/red-velvet.jpg",
    isBestSeller: true,
    isTodaySpecial: false,
    variants: [
      { flavor: "Royal Red Velvet", size: "0.5 kg", price: 29.00, stock: 30 },
      { flavor: "Royal Red Velvet", size: "1 kg", price: 45.00, stock: 35 },
      { flavor: "Royal Red Velvet", size: "2 kg", price: 85.00, stock: 10 }
    ],
    discount: 10
  },
  {
    id: "strawberry-bliss",
    name: "Classic Strawberry Shortcake",
    description: "Double layers of vanilla sponge stuffed with fresh glazed strawberry slices and light, fluffy fresh vanilla cream frosting.",
    categories: ["Birthday Cakes", "Kids Cakes"],
    basePrice: 33.99,
    rating: 4.6,
    reviewsCount: 95,
    image: "/images/cakes/strawberry-bliss.jpg",
    isBestSeller: false,
    isTodaySpecial: false,
    variants: [
      { flavor: "Strawberry Cream", size: "0.5 kg", price: 21.99, stock: 14 },
      { flavor: "Strawberry Cream", size: "1 kg", price: 33.99, stock: 18 }
    ],
    discount: 0
  },
  {
    id: "vanilla-bean",
    name: "Gourmet Vanilla Bean Dream",
    description: "Decadent vanilla cake featuring real Madagascar vanilla bean caviar flecks inside soft butter sponge and rich buttercream frosting.",
    categories: ["Birthday Cakes", "Premium Cakes"],
    basePrice: 36.00,
    rating: 4.7,
    reviewsCount: 78,
    image: "/images/cakes/vanilla-bean.jpg",
    isBestSeller: false,
    isTodaySpecial: false,
    variants: [
      { flavor: "Madagascar Vanilla Bean", size: "1 kg", price: 36.00, stock: 20 }
    ],
    discount: 5
  },
  {
    id: "wedding-classic",
    name: "Classic Tiered Lace Wedding Cake",
    description: "An elegant, multi-tiered masterpiece with custom fondant lace details, stuffed with classic rich fruitcake or chocolate layers of your choice.",
    categories: ["Wedding Cakes"],
    basePrice: 199.00,
    rating: 5.0,
    reviewsCount: 42,
    image: "/images/cakes/wedding-classic.jpg",
    isBestSeller: true,
    isTodaySpecial: false,
    variants: [
      { flavor: "Traditional Rich Fruitcake", size: "3 kg", price: 199.00, stock: 3 },
      { flavor: "Belgian Chocolate Truffle", size: "3 kg", price: 220.00, stock: 5 },
      { flavor: "Classic Vanilla Praline", size: "3 kg", price: 210.00, stock: 4 }
    ],
    discount: 0
  },
  {
    id: "wedding-elegance",
    name: "Elegant Pearl Cascading Cake",
    description: "A three-tier luxury cake decorated with edible sugar pearls and a cascade of beautiful handcrafted white sugar roses.",
    categories: ["Wedding Cakes", "Premium Cakes"],
    basePrice: 249.99,
    rating: 4.9,
    reviewsCount: 36,
    image: "/images/cakes/wedding-elegance.jpg",
    isBestSeller: false,
    isTodaySpecial: false,
    variants: [
      { flavor: "Champagne Vanilla Bean", size: "3 kg", price: 249.99, stock: 2 },
      { flavor: "Salted Caramel Velvet", size: "3 kg", price: 269.99, stock: 2 }
    ],
    discount: 5
  },
  {
    id: "wedding-garden",
    name: "Secret Garden Floral Tier",
    description: "Whimsical rustic wedding cake dressed in textured buttercream frosting and decorated with fresh, organic, seasonal colorful flowers.",
    categories: ["Wedding Cakes"],
    basePrice: 180.00,
    rating: 4.8,
    reviewsCount: 29,
    image: "/images/cakes/wedding-garden.jpg",
    isBestSeller: false,
    isTodaySpecial: false,
    variants: [
      { flavor: "Lemon Elderflower", size: "3 kg", price: 180.00, stock: 3 },
      { flavor: "White Chocolate Raspberry", size: "3 kg", price: 195.00, stock: 4 }
    ],
    discount: 0
  },
  {
    id: "wedding-season",
    name: "Luxury Gold Leaf Ivory Cake",
    description: "Opulent wedding cake covered in smooth ivory fondant, detailed with delicate flakes of 24k edible gold leaf and white orchids.",
    categories: ["Wedding Cakes", "Premium Cakes"],
    basePrice: 280.00,
    rating: 5.0,
    reviewsCount: 24,
    image: "/images/cakes/wedding-season.jpg",
    isBestSeller: true,
    isTodaySpecial: true,
    variants: [
      { flavor: "Gold Leaf Chocolate Ganache", size: "3 kg", price: 280.00, stock: 2 },
      { flavor: "Red Velvet Cream Cheese Premium", size: "3 kg", price: 295.00, stock: 3 }
    ],
    discount: 10
  }
];
