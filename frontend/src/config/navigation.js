export const CATEGORIES = [
  { label: "Birthday Cakes", href: "/shop?category=Birthday Cakes" },
  { label: "Anniversary Cakes", href: "/shop?category=Anniversary Cakes" },
  { label: "Wedding Cakes", href: "/shop?category=Wedding Cakes" },
  { label: "Photo Cakes", href: "/shop?category=Photo Cakes" },
  { label: "Eggless Cakes", href: "/shop?category=Eggless Cakes" },
  { label: "Chocolate Cakes", href: "/shop?category=Chocolate Cakes" },
  { label: "Strawberry Cakes", href: "/shop?category=Strawberry Cakes" },
  { label: "Black Forest", href: "/shop?category=Black Forest" },
  { label: "Butterscotch", href: "/shop?category=Butterscotch" },
  { label: "Red Velvet", href: "/shop?category=Red Velvet" },
  { label: "Designer Cakes", href: "/shop?category=Designer Cakes" },
  { label: "Cupcakes", href: "/shop?category=Cupcakes" },
  { label: "Pastries", href: "/shop?category=Pastries" }
];

export const OCCASIONS = [
  { label: "Birthday", href: "/shop?occasion=Birthday" },
  { label: "Anniversary", href: "/shop?occasion=Anniversary" },
  { label: "Wedding", href: "/shop?occasion=Wedding" },
  { label: "Mother's Day", href: "/shop?occasion=Mothers Day" },
  { label: "Father's Day", href: "/shop?occasion=Fathers Day" },
  { label: "Valentine's Day", href: "/shop?occasion=Valentines Day" },
  { label: "Friendship Day", href: "/shop?occasion=Friendship Day" },
  { label: "Raksha Bandhan", href: "/shop?occasion=Raksha Bandhan" },
  { label: "Diwali", href: "/shop?occasion=Diwali" },
  { label: "Christmas", href: "/shop?occasion=Christmas" },
  { label: "New Year", href: "/shop?occasion=New Year" }
];

export const CAKE_TYPES = [
  { label: "Eggless", href: "/shop?type=Eggless" },
  { label: "Premium Cakes", href: "/shop?type=Premium Cakes" },
  { label: "Designer Cakes", href: "/shop?type=Designer Cakes" },
  { label: "Fondant Cakes", href: "/shop?type=Fondant Cakes" },
  { label: "Kids Cakes", href: "/shop?type=Kids Cakes" },
  { label: "Theme Cakes", href: "/shop?type=Theme Cakes" },
  { label: "Bento Cakes", href: "/shop?type=Bento Cakes" },
  { label: "Cupcakes", href: "/shop?type=Cupcakes" },
  { label: "Pastries", href: "/shop?type=Pastries" }
];

export const MAIN_NAV = [
  // { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", isDropdown: true, items: CATEGORIES },
  { label: "Occasions", isDropdown: true, items: OCCASIONS },
  { label: "Cake Types", isDropdown: true, items: CAKE_TYPES },
  { label: "Our Story", href: "/about" },
  { label: "Contact", href: "/contact" }
];

export const USER_MENU = [
  { label: "My Profile", href: "/profile" },
];

export const FOOTER_LINKS = {
  company: [
    { label: "Our Story", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/career" },
    { label: "Blog", href: "/blog" }
  ],
  support: [
    { label: "FAQ", href: "/faq" },
    { label: "Track Order", href: "/track-order" },
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Return & Refund Policy", href: "/return-policy" },
    { label: "Cancellation Policy", href: "/cancellation-policy" }
  ],
  categories: [
    { label: "Birthday Cakes", href: "/shop?category=Birthday Cakes" },
    { label: "Anniversary Cakes", href: "/shop?category=Anniversary Cakes" },
    { label: "Eggless Cakes", href: "/shop?category=Eggless Cakes" },
    { label: "Designer Cakes", href: "/shop?category=Designer Cakes" },
    { label: "Photo Cakes", href: "/shop?category=Photo Cakes" }
  ],
  quickLinks: [
    { label: "Shop", href: "/shop" },
    { label: "Offers", href: "/offers" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Cart", href: "/cart" },
    { label: "Login/Profile", href: "/profile" }
  ]
};
