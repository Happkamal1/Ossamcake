import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Star, ShoppingCart, Settings } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import LazyImage from "@/components/shared/LazyImage";
import { toast } from "sonner";

export default function ProductCard({ cake }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const discountAmount = cake.discount ? (cake.basePrice * cake.discount) / 100 : 0;
  const finalPrice = cake.basePrice - discountAmount;
  const isWishlisted = isInWishlist(cake.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Add default variant (first variant or default options)
    const defaultVariant = cake.variants?.[0] || { flavor: "Classic", size: "1 kg" };
    
    addToCart({
      cakeId: cake.id,
      name: cake.name,
      image: cake.image,
      flavor: defaultVariant.flavor,
      weight: defaultVariant.size,
      isEggless: false,
      cakeMessage: "",
      photoUpload: null,
      price: cake.basePrice,
      discount: cake.discount,
      quantity: 1
    });

    toast.success(`${cake.name} added to cart!`, {
      description: "Default size and flavor selected. Customize in cart if needed.",
      action: {
        label: "View Cart",
        onClick: () => window.location.assign("/cart")
      }
    });
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(cake.id);
    if (!isWishlisted) {
      toast.success(`Saved ${cake.name} to Wishlist!`);
    } else {
      toast.info(`Removed ${cake.name} from Wishlist`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative bg-white rounded-3xl overflow-hidden border border-pink-50 shadow-sm hover:shadow-xl transition-all flex flex-col h-full"
    >
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-4 right-4 z-10 p-2.5 rounded-full border shadow-sm transition-all focus:outline-none ${
          isWishlisted
            ? "bg-pink-500 border-pink-500 text-white"
            : "bg-white/80 backdrop-blur-sm border-pink-50 text-gray-400 hover:text-pink-500"
        }`}
      >
        <Heart className={`h-4.5 w-4.5 ${isWishlisted ? "fill-current" : ""}`} />
      </button>

      {/* Floating Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
        {cake.discount > 0 && (
          <span className="bg-pink-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {cake.discount}% OFF
          </span>
        )}
        {cake.isBestSeller && (
          <span className="bg-purple-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Bestseller
          </span>
        )}
      </div>

      {/* Product Image Link */}
      <Link to={`/cake/${cake.id}`} className="block relative aspect-square overflow-hidden bg-pink-50/20">
        <LazyImage
          src={cake.image}
          alt={cake.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
        />
        {/* Soft Hover Overlay */}
        <div className="absolute inset-0 bg-pink-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Categories / Tags */}
          <div className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">
            {cake.categories?.[0]}
          </div>

          {/* Name */}
          <Link to={`/cake/${cake.id}`} className="block">
            <h3 className="font-bold text-gray-800 group-hover:text-pink-600 line-clamp-1 transition-colors text-base">
              {cake.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(cake.rating) ? "fill-current" : "text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 font-semibold">{cake.rating}</span>
            <span className="text-xs text-gray-300">|</span>
            <span className="text-[10px] text-gray-400 font-medium">({cake.reviewsCount} reviews)</span>
          </div>

          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-normal">
            {cake.description}
          </p>
        </div>

        <div className="mt-5 pt-3 border-t border-pink-50 flex items-center justify-between gap-2">
          {/* Price Container */}
          <div>
            {cake.discount > 0 && (
              <span className="text-xs text-gray-400 line-through mr-1 font-medium">
                ${cake.basePrice.toFixed(2)}
              </span>
            )}
            <span className="text-lg font-extrabold text-pink-500">
              ${finalPrice.toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5">
            {/* Customize Link */}
            <Link
              to={`/cake/${cake.id}`}
              className="p-2 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors"
              title="Customize Cake"
            >
              <Settings className="h-4 w-4" />
            </Link>

            {/* Quick Add */}
            <button
              onClick={handleAddToCart}
              className="px-3.5 py-2 rounded-xl bg-pink-500 hover:bg-pink-650 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm hover:shadow"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
