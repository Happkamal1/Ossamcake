import { Link } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { cakesData } from "@/data/cakesData";
import ProductCard from "@/components/product/ProductCard";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Wishlist() {
  const { wishlistItems } = useWishlist();

  // Filter cakes that are in the wishlist array
  const savedCakes = cakesData.filter((c) => wishlistItems.includes(c.id));

  if (savedCakes.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#FFF8F9] py-12 px-4 text-center">
        <div className="h-20 w-20 bg-pink-105 rounded-full flex items-center justify-center text-pink-500 mb-6 border border-pink-100">
          <Heart className="h-10 w-10 text-pink-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your Wishlist is Empty</h2>
        <p className="text-gray-500 mb-8 max-w-sm">Save your favorite cakes here to order them for your upcoming celebrations.</p>
        <Button asChild className="bg-pink-500 hover:bg-pink-600 rounded-full font-bold px-8 py-5">
          <Link to="/shop">Explore Cake Menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF8F9] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Title */}
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900">My Wishlist</h1>
          <p className="text-sm text-gray-500">You have saved {savedCakes.length} cakes for later.</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {savedCakes.map((cake) => (
            <ProductCard key={cake.id} cake={cake} />
          ))}
        </div>

      </div>
    </div>
  );
}
