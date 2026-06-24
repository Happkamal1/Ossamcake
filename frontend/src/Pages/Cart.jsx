import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ShoppingBag, Plus, Minus, Gift, Percent, CreditCard, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const CROSS_SELLS = [
  { id: "candles-pack", name: "Premium Metallic Birthday Candles (12 Pack)", price: 2.99, image: "/images/cakes/custom-birthday.jpg" },
  { id: "greeting-card-pop", name: "3D Pop-Up Love Greeting Card", price: 4.50, image: "/images/cakes/red-velvet.jpg" },
  { id: "knife-wooden", name: "Eco-Friendly Premium Wooden Cake Knife", price: 1.20, image: "/images/cakes/vanilla-bean.jpg" }
];

export default function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    coupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discountAmount,
    deliveryCharge,
    grandTotal,
    addToCart
  } = useCart();

  const [couponCode, setCouponCode] = useState("");

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const res = applyCoupon(couponCode);
    if (res.success) {
      toast.success(`Coupon ${couponCode.toUpperCase()} applied!`, {
        description: `You got a discount of ${res.discountPercent}%!`
      });
      setCouponCode("");
    } else {
      toast.error("Invalid coupon code!", {
        description: "Try BDAY15, WELCOME10, or SWEET20."
      });
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
    toast.success(`${item.name} added to your order!`);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#FFF8F9] py-12 px-4 text-center">
        <div className="h-20 w-20 bg-pink-100/60 rounded-full flex items-center justify-center text-pink-500 mb-6">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your Shopping Cart is Empty</h2>
        <p className="text-gray-500 mb-8 max-w-sm">Add some delicious cakes to your cart and make your celebrations memorable.</p>
        <Button asChild className="bg-pink-500 hover:bg-pink-600 rounded-full font-bold px-8 py-5">
          <Link to="/shop">Browse Cakes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF8F9] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <h1 className="text-3xl font-extrabold text-gray-900 text-left mb-10">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Cart Items list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-pink-50 shadow-sm p-6 space-y-6">
              {cartItems.map((item) => {
                const discountedUnitPrice = item.price * (1 - (item.discount || 0) / 100);
                const lineTotal = discountedUnitPrice * item.quantity;
                
                return (
                  <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-pink-50 last:border-0 last:pb-0">
                    
                    {/* Cake Image & Details */}
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-2xl overflow-hidden shrink-0 border border-pink-50 bg-pink-50/10">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      
                      <div className="text-left space-y-1">
                        <h3 className="font-bold text-gray-800 text-sm sm:text-base line-clamp-1">{item.name}</h3>
                        
                        {/* Custom tags */}
                        <div className="flex flex-wrap gap-2 text-[10px]">
                          <span className="bg-pink-50 text-pink-600 px-2 py-0.5 rounded font-semibold border border-pink-100">
                            {item.flavor}
                          </span>
                          <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded font-semibold border border-purple-100">
                            {item.weight}
                          </span>
                          {item.isEggless && (
                            <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded font-semibold border border-green-150">
                              Eggless
                            </span>
                          )}
                        </div>

                        {item.cakeMessage && (
                          <div className="text-xs text-gray-500 font-medium">
                            Message: <span className="text-pink-600 italic">"{item.cakeMessage}"</span>
                          </div>
                        )}

                        {item.photoUpload && (
                          <div className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 bg-green-500 rounded-full" /> Photo layout added
                          </div>
                        )}

                        {item.deliveryDate && (
                          <div className="text-[10px] text-gray-400 font-medium">
                            Scheduled: {item.deliveryDate} | {item.deliveryTimeSlot}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quantity Selector & Price Calculations */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-pink-100 rounded-full bg-pink-50/30 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-100 transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-4 text-xs font-bold text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-100 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Prices */}
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-pink-500">${lineTotal.toFixed(2)}</div>
                        <div className="text-[10px] text-gray-400 font-medium">${discountedUnitPrice.toFixed(2)} each</div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all shrink-0"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Cross Sells Section */}
            <div className="bg-white rounded-3xl border border-pink-50 shadow-sm p-6 space-y-6">
              <h3 className="text-lg font-extrabold text-gray-800 text-left">Frequently Bought Together</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {CROSS_SELLS.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-pink-50/20 border border-pink-100/30 text-center flex flex-col justify-between items-center space-y-3">
                    <div className="h-16 w-16 rounded-full overflow-hidden border border-pink-100 bg-white">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-800 text-xs line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-pink-500 font-bold">${item.price.toFixed(2)}</p>
                    </div>
                    <Button
                      onClick={() => handleAddCrossSell(item)}
                      size="sm"
                      variant="outline"
                      className="border-pink-200 hover:bg-pink-50 text-pink-650 rounded-full font-bold text-xs"
                    >
                      Add Extra
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Pricing Summary */}
          <aside className="space-y-6">
            
            {/* Promo Code Box */}
            <div className="bg-white rounded-3xl border border-pink-50 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 text-sm text-left mb-4 flex items-center gap-1.5">
                <Gift className="h-4 w-4 text-pink-500" /> Apply Coupon Code
              </h3>
              
              {coupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Percent className="h-4 w-4" />
                    <span>Applied: <strong>{coupon.code}</strong> (-{coupon.discountPercent}%)</span>
                  </div>
                  <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 underline text-[10px]">
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
                    className="bg-pink-50/20 border-pink-100 focus-visible:ring-pink-500 rounded-xl text-sm"
                  />
                  <Button type="submit" className="bg-pink-500 hover:bg-pink-600 rounded-xl font-bold">
                    Apply
                  </Button>
                </form>
              )}
            </div>

            {/* Subtotal Checkout Panel */}
            <div className="bg-white rounded-3xl border border-pink-50 shadow-sm p-6 space-y-6 text-left">
              <h3 className="font-bold text-gray-900 text-lg border-b border-pink-50 pb-3">Order Summary</h3>
              
              <div className="space-y-3 text-sm text-gray-650">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                
                {coupon && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Promo Discount ({coupon.code})</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-gray-900">
                    {deliveryCharge === 0 ? <strong className="text-green-600">FREE</strong> : `$${deliveryCharge.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <hr className="border-pink-50" />

              <div className="flex justify-between text-base sm:text-lg font-black text-gray-900">
                <span>Grand Total</span>
                <span className="text-pink-500">${grandTotal.toFixed(2)}</span>
              </div>

              {subtotal < 80 && (
                <p className="text-[10px] text-gray-400 bg-pink-50/30 p-3 rounded-xl border border-pink-100/50 leading-relaxed text-center">
                  💡 Add only <strong className="text-pink-500">${(80 - subtotal).toFixed(2)}</strong> more to unlock <strong>FREE DELIVERY</strong>!
                </p>
              )}

              <Button asChild className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-6 rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-pink-100 text-base">
                <Link to="/checkout">
                  Proceed to Checkout <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            
          </aside>
        </div>

      </div>
    </div>
  );
}
