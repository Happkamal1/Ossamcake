import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "@/hooks/useWishlist";
import ProductCard from "@/components/product/ProductCard";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Wishlist() {
  const { wishlistItems, getWishlist } = useWishlist();

  useEffect(() => {
    getWishlist();
  }, []);

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-background py-12 px-4 text-center">
        <div className="h-20 w-20 bg-secondary rounded-full flex items-center justify-center text-primary mb-6 border border-border animate-pulse">
          <Heart className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground mb-2">Your Wishlist is Empty</h2>
        <p className="text-muted-foreground mb-8 max-w-sm">
          Save your favorite cakes here to order them for your upcoming celebrations.
        </p>
        <Button asChild className="bg-primary hover:bg-primary rounded-full font-bold px-8 py-5">
          <Link to="/shop">Explore Cake Menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Title */}
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground">My Wishlist</h1>
          <p className="text-sm text-muted-foreground">
            You have saved {wishlistItems.length} cake{wishlistItems.length !== 1 ? "s" : ""} for later.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlistItems.map((cake) => (
            <ProductCard key={cake._id || cake.id} cake={cake} />
          ))}
        </div>

      </div>
    </div>
  );
}
