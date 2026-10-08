import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Eye, Trash2 } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getImageUrl } from "@/lib/api";

const FALLBACK_CAKE = "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/products/custom-birthday.jpg";

export default function WishlistGrid() {
  const { wishlistItems, getWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    getWishlist();
  }, []);

  const handleAddToCart = (cake) => {
    addToCart({
      cakeId: cake._id || cake.id,
      name: cake.name,
      price: cake.basePrice,
      flavor: cake.variants?.[0]?.flavor || "Original",
      weight: cake.variants?.[0]?.size || "1 kg",
      isEggless: false,
      quantity: 1,
      image: cake.image || cake.thumbnail
    });
    toast.success(`${cake.name} added to cart!`);
  };

  const handleRemove = (cakeId) => {
    toggleWishlist(cakeId);
    toast.info("Item removed from wishlist.");
  };

  return (
    <Card className="border border-border shadow-sm rounded-3xl text-left bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-extrabold text-foreground flex items-center gap-2">
          <Heart className="h-5.5 w-5.5 text-primary animate-pulse" /> Saved Favorites
        </CardTitle>
        <CardDescription>Browse the dessert items you've saved to your wishlist book.</CardDescription>
      </CardHeader>
      <CardContent>
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {wishlistItems.map((cake, idx) => (
              <motion.div 
                key={cake._id || cake.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: idx * 0.05 } }}
                className="border border-border rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group bg-secondary/10"
              >
                <div className="relative overflow-hidden aspect-video">
                  <img 
                    src={getImageUrl(cake.image || cake.thumbnail, FALLBACK_CAKE)} 
                    alt={cake.name} 
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  {/* Remove button overlay */}
                  <button 
                    onClick={() => handleRemove(cake._id || cake.id)} 
                    className="absolute top-3 right-3 bg-background/95 hover:bg-background text-destructive p-2 rounded-full shadow-sm hover:scale-105 transition-transform z-10"
                    title="Remove from favorites"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between text-left space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-foreground text-sm line-clamp-1">{cake.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{cake.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-black text-primary text-base">₹{cake.basePrice.toFixed(2)}</span>
                    <div className="flex gap-2">
                      <Button 
                        asChild
                        size="sm" 
                        variant="outline" 
                        className="rounded-xl px-3 border-border hover:bg-secondary h-8"
                      >
                        <Link to={`/cake/${cake.slug || cake.id}`} title="View Details">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        onClick={() => handleAddToCart(cake)} 
                        size="sm" 
                        className="bg-primary hover:bg-primary/95 text-xs font-bold rounded-xl h-8 gap-1.5"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mx-auto text-muted-foreground">
              <Heart className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Wishlist is empty</p>
              <p className="text-xs text-muted-foreground mt-1">Bookmark your favorite custom flavors to view them here.</p>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/95 rounded-xl font-bold h-11">
              <Link to="/shop">Explore Cake Flavors</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
