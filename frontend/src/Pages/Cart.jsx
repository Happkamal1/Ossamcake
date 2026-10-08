import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Trash2, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Gift, 
  Percent, 
  ChevronRight, 
  Heart, 
  Truck, 
  Info,
  Sparkles,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "@/lib/api";

const CROSS_SELLS = [
  { id: "64b0f1a9d8a3f8c8b1234812", name: "Premium Metallic Birthday Candles (12 Pack)", price: 150, image: "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/products/custom-birthday.jpg" },
  { id: "64b0f1a9d8a3f8c8b1234813", name: "3D Pop-Up Love Greeting Card", price: 250, image: "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/products/red-velvet.jpg" },
  { id: "64b0f1a9d8a3f8c8b1234814", name: "Eco-Friendly Premium Wooden Cake Knife", price: 80, image: "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/products/vanilla-bean.jpg" }
];

export default function Cart() {
  const {
    cartItems,
    getCart,
    removeFromCart,
    updateQuantity,
    coupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discountAmount,
    deliveryCharge,
    taxAmount,
    grandTotal,
    addToCart
  } = useCart();

  const { addToWishlist } = useWishlist();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    getCart();
  }, []);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    const res = await applyCoupon(couponCode);
    setCouponLoading(false);

    if (res.success) {
      toast.success(`Coupon "${couponCode.toUpperCase()}" applied successfully!`);
      setCouponCode("");
    } else {
      toast.error(res.message || "Invalid coupon code!");
    }
  };

  const handleMoveToWishlist = async (item) => {
    try {
      await addToWishlist(item.cakeId);
      await removeFromCart(item.id);
      toast.success("Item moved to your Wishlist!");
    } catch (err) {
      toast.error("Failed to move item to Wishlist.");
    }
  };

  const handleAddCrossSell = (item) => {
    addToCart({
      cakeId: item.id,
      name: item.name,
      image: item.image,
      flavor: "Party Essential",
      weight: "1 Unit",
      isEggless: false,
      cakeMessage: "",
      photoUpload: null,
      price: item.price,
      discount: 0,
      quantity: 1
    });
    toast.success(`${item.name} added to your cart!`);
  };

  const { settings } = useSelector((state) => state.siteSettings);

  // Free shipping logic details
  const freeShippingThreshold = settings?.shipping?.freeShippingThreshold ?? 800; // Dynamic free delivery threshold
  const currentSubtotal = subtotal;
  const isFreeDelivery = currentSubtotal >= freeShippingThreshold;
  const progressPercent = Math.min(100, (currentSubtotal / freeShippingThreshold) * 100);
  const remainingForFree = Math.max(0, freeShippingThreshold - currentSubtotal);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background py-16 px-4 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="h-24 w-24 bg-pink-50 dark:bg-pink-950/20 rounded-full flex items-center justify-center text-primary mb-6 shadow-inner"
        >
          <ShoppingBag className="h-12 w-12 text-pink-600" />
        </motion.div>
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-black text-foreground mb-3"
        >
          Your Cart is Empty
        </motion.h2>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground mb-8 max-w-sm text-sm"
        >
          Choose from our selection of gourmet artisanal cakes to start celebrating!
        </motion.p>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button asChild className="bg-pink-600 hover:bg-pink-700 text-white rounded-full font-bold px-10 py-6 text-base shadow-lg shadow-pink-600/20">
            <Link to="/shop">Explore Our Shop</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="flex items-center gap-3 mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">Shopping Cart</h1>
          <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs font-bold px-3 py-1 rounded-full">
            {cartItems.reduce((acc, item) => acc + item.quantity, 0)} Items
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Free Delivery Banner */}
            <motion.div 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-card border border-border rounded-3xl p-5 shadow-sm text-left relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-3">
                <Truck className="h-5 w-5 text-pink-600 shrink-0" />
                <span className="font-bold text-foreground text-sm">
                  {isFreeDelivery ? "Congratulations! You've unlocked FREE Delivery 🚀" : "Free Delivery Progress"}
                </span>
              </div>
              <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden mb-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8 }}
                  className="bg-pink-600 h-full rounded-full"
                />
              </div>
              {!isFreeDelivery && (
                <p className="text-xs text-muted-foreground">
                  Add <strong className="text-pink-600">₹{remainingForFree.toFixed(2)}</strong> more to get free doorstep delivery!
                </p>
              )}
            </motion.div>

            {/* Cart Items List Wrapper */}
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden divide-y divide-border">
              <AnimatePresence>
                {cartItems.map((item) => {
                  const discountedUnitPrice = item.price * (1 - (item.discount || 0) / 100);
                  const lineTotal = discountedUnitPrice * item.quantity;

                  return (
                    <motion.div 
                      key={item.id}
                      layout
                      exit={{ opacity: 0, x: -50 }}
                      className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-secondary/20 transition-colors"
                    >
                      {/* Left: Product Thumbnail & Meta */}
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="h-24 w-24 rounded-2xl overflow-hidden shrink-0 border border-border shadow-sm bg-secondary relative">
                          <img src={getImageUrl(item.image)} alt={item.name} className="h-full w-full object-cover" />
                          {item.discount > 0 && (
                            <span className="absolute top-2 left-2 bg-pink-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md">
                              {item.discount}% OFF
                            </span>
                          )}
                        </div>

                        <div className="text-left space-y-1.5 flex-1 min-w-0">
                          <h3 className="font-bold text-foreground text-base line-clamp-1 hover:text-pink-600 transition-colors">
                            {item.name}
                          </h3>

                          {/* Spec Badges */}
                          <div className="flex flex-wrap gap-1.5">
                            <span className="bg-secondary text-foreground text-[10px] font-bold px-2 py-0.5 rounded border border-border">
                              {item.flavor}
                            </span>
                            <span className="bg-secondary text-foreground text-[10px] font-bold px-2 py-0.5 rounded border border-border">
                              {item.weight}
                            </span>
                            {item.isEggless && (
                              <span className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200">
                                Eggless
                              </span>
                            )}
                          </div>

                          {/* Custom message */}
                          {item.cakeMessage && (
                            <p className="text-xs text-muted-foreground font-medium italic">
                              Message: <span className="text-pink-600 font-semibold">"{item.cakeMessage}"</span>
                            </p>
                          )}

                          {/* Photo Cake Preview */}
                          {item.photoUpload && (
                            <div className="text-[10px] text-pink-600 font-bold flex items-center gap-1">
                              <Sparkles className="h-3 w-3" /> Photo Customization Applied
                            </div>
                          )}

                          {/* Delivery Schedule (if defined) */}
                          {item.deliveryDate && (
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                              <Calendar className="h-3 w-3 text-pink-600" />
                              Scheduled: {item.deliveryDate} | {item.deliveryTimeSlot}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Controls & Price */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                        
                        {/* Quantity controls */}
                        <div className="flex items-center border border-border rounded-full bg-secondary shadow-sm overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2.5 text-muted-foreground hover:text-pink-600 hover:bg-secondary-hover transition-colors disabled:opacity-40"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-4 text-xs font-black text-foreground">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2.5 text-muted-foreground hover:text-pink-600 hover:bg-secondary-hover transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Prices */}
                        <div className="text-right min-w-[80px]">
                          <div className="text-base font-black text-pink-600">₹{lineTotal.toFixed(2)}</div>
                          {item.discount > 0 && (
                            <div className="text-[10px] text-muted-foreground line-through font-medium">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                          )}
                        </div>

                        {/* Actions: Save for later / Remove */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveToWishlist(item)}
                            title="Move to Wishlist"
                            className="text-muted-foreground hover:text-pink-600 p-2.5 hover:bg-pink-50 dark:hover:bg-pink-950/20 rounded-full transition-all"
                          >
                            <Heart className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            title="Remove item"
                            className="text-muted-foreground hover:text-red-600 p-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition-all"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Cross Sells Recommendations */}
            <div className="bg-card rounded-3xl border border-border shadow-sm p-6 space-y-6 text-left">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-pink-600" />
                <h3 className="text-lg font-black text-foreground">Complete Your Celebration</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {CROSS_SELLS.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-secondary/35 border border-border flex flex-col justify-between items-center text-center space-y-3 hover:shadow-md transition">
                    <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-white shadow bg-card">
                      <img src={getImageUrl(item.image)} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-foreground text-xs line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-pink-600 font-extrabold">₹{item.price}</p>
                    </div>
                    <Button
                      onClick={() => handleAddCrossSell(item)}
                      size="sm"
                      variant="outline"
                      className="border-pink-200 hover:bg-pink-50 text-pink-600 rounded-full font-bold text-[10px] w-full"
                    >
                      Add to Order
                    </Button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Checkout Pricing Summary (Sticky) */}
          <aside className="lg:sticky lg:top-8 space-y-6">
            
            {/* Promo Code Coupon Panel */}
            <div className="bg-card rounded-3xl border border-border shadow-sm p-6 text-left">
              <h3 className="font-extrabold text-foreground text-sm mb-4 flex items-center gap-2">
                <Gift className="h-4.5 w-4.5 text-pink-600" /> Apply Promo Code
              </h3>
              
              {coupon ? (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl px-4 py-3 text-green-700 dark:text-green-400 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Percent className="h-4 w-4" />
                    <span>Applied: <strong>{coupon.code}</strong> (-₹{discountAmount})</span>
                  </div>
                  <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 underline text-[10px] font-bold">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="E.g., WELCOME10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="bg-secondary border-border focus-visible:ring-ring rounded-xl text-sm"
                  />
                  <Button type="submit" disabled={couponLoading} className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold px-6">
                    {couponLoading ? "Applying..." : "Apply"}
                  </Button>
                </form>
              )}
            </div>

            {/* Detailed Bill Details Panel */}
            <div className="bg-card rounded-3xl border border-border shadow-sm p-6 space-y-6 text-left">
              <h3 className="font-extrabold text-foreground text-lg border-b border-border pb-3">Bill Details</h3>
              
              <div className="space-y-3.5 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="font-bold text-foreground">₹{subtotal.toFixed(2)}</span>
                </div>
                
                {coupon && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Coupon Discount ({coupon.code})</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Delivery Charge</span>
                  <span className="font-bold text-foreground">
                    {deliveryCharge === 0 ? <strong className="text-green-600 font-black">FREE</strong> : `₹${deliveryCharge.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>GST / Taxes (5%)</span>
                  <span className="font-bold text-foreground">₹{taxAmount.toFixed(2)}</span>
                </div>
              </div>

              <hr className="border-border" />

              <div className="flex justify-between text-lg font-black text-foreground">
                <span>To Pay</span>
                <span className="text-pink-600 text-xl font-black">₹{grandTotal.toFixed(2)}</span>
              </div>

              <div className="bg-secondary/40 p-4 rounded-2xl border border-border/60 text-xs text-muted-foreground leading-normal flex items-start gap-2">
                <Info className="h-4 w-4 text-pink-600 shrink-0 mt-0.5" />
                <span>
                  Delivering fresh, high-quality cakes. Select delivery instructions & timings on the checkout page.
                </span>
              </div>

              <Button 
                onClick={() => navigate("/checkout")}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-6 rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-pink-600/10 text-base"
              >
                Proceed to Checkout <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            
          </aside>
        </div>

      </div>
    </div>
  );
}
