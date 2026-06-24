import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { cakesData } from "@/data/cakesData";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Heart,
  Star,
  ShoppingBag,
  Sparkles,
  Calendar,
  Clock,
  Egg,
  MessageSquare,
  Upload,
  Plus,
  HelpCircle,
  TrendingUp
} from "lucide-react";

export default function CakeDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const cake = cakesData.find((c) => c.id === id);

  // Default Customization States
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isEggless, setIsEggless] = useState(false);
  const [cakeMessage, setCakeMessage] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  // Addons states
  const [addCandles, setAddCandles] = useState(false);
  const [addKnife, setAddKnife] = useState(false);
  const [addGreetingCard, setAddGreetingCard] = useState(false);
  const [cardMessage, setCardMessage] = useState("");

  // Delivery Scheduling
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("Afternoon (12 PM - 4 PM)");

  // Active view image (supporting small gallery)
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    if (cake) {
      // Default to first variant
      setSelectedVariant(cake.variants?.[0] || { flavor: "Classic", size: "1 kg", price: cake.basePrice });
      setActiveImage(cake.image);
    }
  }, [cake]);

  if (!cake) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#FFF8F9] py-12">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Cake Not Found</h2>
        <p className="text-gray-500 mb-6">The sweet creation you are looking for does not exist or has been eaten!</p>
        <Button asChild className="bg-pink-500 hover:bg-pink-600 rounded-full font-bold">
          <Link to="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  // Price calculations based on variants and options
  const isWishlisted = isInWishlist(cake.id);
  const discountRate = cake.discount || 0;
  const rawPrice = selectedVariant ? selectedVariant.price : cake.basePrice;
  const discountVal = (rawPrice * discountRate) / 100;
  
  // Extra options cost
  let extrasCost = 0;
  if (isEggless) extrasCost += 1.50; // extra charge for eggless preparation
  if (addCandles) extrasCost += 2.00;
  if (addKnife) extrasCost += 1.00;
  if (addGreetingCard) extrasCost += 3.00;

  const finalUnitPrice = rawPrice - discountVal + extrasCost;

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      toast.success("Photo uploaded successfully!");
    }
  };

  const handleAddToCart = () => {
    if (!deliveryDate) {
      toast.error("Please choose a Delivery Date before adding to cart!");
      document.getElementById("delivery-date-input")?.focus();
      return;
    }

    // Build line item add data
    const itemData = {
      cakeId: cake.id,
      name: cake.name,
      image: cake.image,
      flavor: selectedVariant ? selectedVariant.flavor : "Classic",
      weight: selectedVariant ? selectedVariant.size : "1 kg",
      isEggless,
      cakeMessage: cakeMessage.trim(),
      photoUpload: photoPreview,
      price: rawPrice + extrasCost,
      discount: discountRate,
      quantity: 1,
      deliveryDate,
      deliveryTimeSlot,
      addons: {
        candles: addCandles,
        knife: addKnife,
        greetingCard: addGreetingCard,
        cardMessage: addGreetingCard ? cardMessage : ""
      }
    };

    addToCart(itemData);
    toast.success(`${cake.name} customized & added to cart!`, {
      action: {
        label: "Checkout Now",
        onClick: () => window.location.assign("/cart")
      }
    });
  };

  // Find related cakes based on sharing categories
  const relatedCakes = cakesData
    .filter((c) => c.id !== cake.id && c.categories?.some((cat) => cake.categories?.includes(cat)))
    .slice(0, 4);

  return (
    <div className="bg-[#FFF8F9] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Product Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 sm:p-8 rounded-3xl border border-pink-50 shadow-sm">
          
          {/* Left Column: Image Gallery & Previews */}
          <div className="space-y-6">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-pink-50 bg-pink-50/10 group cursor-zoom-in">
              <img
                src={activeImage}
                alt={cake.name}
                className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-700 ease-out"
              />
              {/* Floating Discount Tag */}
              {discountRate > 0 && (
                <span className="absolute top-4 left-4 bg-pink-500 text-white font-extrabold px-3 py-1 rounded-full text-xs shadow-md">
                  {discountRate}% SPECIAL OFF
                </span>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveImage(cake.image)}
                className={`h-20 w-20 rounded-xl overflow-hidden border-2 shrink-0 bg-pink-50/30 ${
                  activeImage === cake.image ? "border-pink-500" : "border-pink-100"
                }`}
              >
                <img src={cake.image} alt={cake.name} className="h-full w-full object-cover" />
              </button>
              
              {/* Mocking secondary details images using variant images */}
              {cake.variants?.map((v, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(cake.image)} // uses base image for mock detail
                  className={`h-20 w-20 rounded-xl overflow-hidden border-2 shrink-0 bg-pink-50/30 border-pink-100/50`}
                >
                  <img src={cake.image} alt="variant thumbnail" className="h-full w-full object-cover filter saturate-75 brightness-95" />
                </button>
              ))}
            </div>

            {/* Trust factors */}
            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100/50 grid grid-cols-2 gap-4 text-xs text-gray-500 text-left">
              <div>🎂 <strong>100% Eggless Option:</strong> Fresh eggless substitute available.</div>
              <div>🚚 <strong>Safely Transported:</strong> Shipped in cold-storage vans.</div>
            </div>
          </div>

          {/* Right Column: Customization Forms */}
          <div className="space-y-6 text-left flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Breadcrumb category */}
              <div className="text-xs font-bold text-pink-500 uppercase tracking-widest">
                {cake.categories?.join("  |  ")}
              </div>

              {/* Title & Actions */}
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                  {cake.name}
                </h1>
                
                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(cake.id)}
                  className={`p-3 rounded-full border shadow-sm transition-all focus:outline-none shrink-0 ${
                    isWishlisted
                      ? "bg-pink-500 border-pink-500 text-white"
                      : "bg-pink-50/50 border-pink-100 text-gray-400 hover:text-pink-500 hover:bg-pink-50"
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Reviews Rating Info */}
              <div className="flex items-center gap-1.5 text-sm">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(cake.rating) ? "fill-current" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-800">{cake.rating}</span>
                <span className="text-gray-300">|</span>
                <span className="text-xs text-gray-500">({cake.reviewsCount} verified reviews)</span>
              </div>

              {/* Price summary */}
              <div className="flex items-baseline gap-2 pt-2">
                {discountRate > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    ${(rawPrice + extrasCost).toFixed(2)}
                  </span>
                )}
                <span className="text-3xl font-black text-pink-500">
                  ${finalUnitPrice.toFixed(2)}
                </span>
                <span className="text-xs text-gray-450 font-semibold ml-1">(Inclusive of taxes)</span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-650 leading-relaxed font-normal">
                {cake.description}
              </p>

              <hr className="border-pink-50 my-6" />

              {/* CUSTOMIZATION CONTROLS */}
              <div className="space-y-6">
                
                {/* 1. Flavor Selection */}
                <div className="space-y-2">
                  <Label className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-pink-500" /> Choose Cake Flavor
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {cake.variants?.map((v, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                          selectedVariant?.flavor === v.flavor
                            ? "bg-pink-500 border-pink-500 text-white font-bold shadow-md shadow-pink-100"
                            : "bg-white border-pink-100 text-gray-700 hover:bg-pink-50/50"
                        }`}
                      >
                        {v.flavor}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Weight Selection */}
                <div className="space-y-2">
                  <Label className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    🎂 Weight / Serving Size
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {cake.variants
                      ?.filter((v) => v.flavor === selectedVariant?.flavor)
                      .map((v, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedVariant(v)}
                          className={`px-5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                            selectedVariant?.size === v.size
                              ? "bg-pink-500 border-pink-500 text-white font-bold shadow-md shadow-pink-100"
                              : "bg-white border-pink-100 text-gray-750 hover:bg-pink-50/50"
                          }`}
                        >
                          {v.size} {v.size === "0.5 kg" ? "(4-6 servings)" : v.size === "1 kg" ? "(8-12 servings)" : "(15+ servings)"}
                        </button>
                      ))}
                  </div>
                </div>

                {/* 3. Eggless Upgrade Option */}
                <div className="p-4 bg-pink-50/40 border border-pink-100/50 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
                      <Egg className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-xs">Make it 100% Eggless</h4>
                      <p className="text-[10px] text-gray-400">Baked with premium vegetarian alternatives (+ $1.50)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEggless(!isEggless)}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                      isEggless ? "bg-pink-500" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        isEggless ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* 4. Message on Cake */}
                <div className="space-y-2">
                  <Label htmlFor="message-box" className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-pink-500" /> Text Message on Cake
                  </Label>
                  <Input
                    id="message-box"
                    placeholder="E.g., Happy Birthday Sarah! (Max 25 characters)"
                    maxLength={25}
                    value={cakeMessage}
                    onChange={(e) => setCakeMessage(e.target.value)}
                    className="bg-pink-50/20 border-pink-100 focus-visible:ring-pink-500 rounded-xl"
                  />
                </div>

                {/* 5. Photo Cake Upload */}
                {cake.categories?.includes("Photo Cakes") && (
                  <div className="space-y-3">
                    <Label className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                      <Upload className="h-4 w-4 text-pink-500" /> Upload Image for Cake Icing
                    </Label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center justify-center gap-2 border border-dashed border-pink-300 hover:border-pink-500 bg-pink-50/10 hover:bg-pink-50/40 px-4 py-3 rounded-xl cursor-pointer text-xs font-semibold text-pink-650 transition-all shrink-0">
                        <Upload className="h-4 w-4" />
                        <span>Choose File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                      </label>
                      
                      {photoPreview ? (
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-pink-100">
                          <img src={photoPreview} alt="upload preview" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400">Supported formats: JPEG, PNG. Max 5MB.</span>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. Celebration Add-ons */}
                <div className="space-y-3 border-t border-pink-50 pt-6">
                  <h4 className="font-bold text-gray-800 text-sm">Add Party Essentials</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    <button
                      onClick={() => setAddCandles(!addCandles)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        addCandles ? "bg-pink-500 border-pink-500 text-white" : "bg-white border-pink-100 text-gray-600"
                      }`}
                    >
                      <span>Candles (+ $2.00)</span>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    
                    <button
                      onClick={() => setAddKnife(!addKnife)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        addKnife ? "bg-pink-500 border-pink-500 text-white" : "bg-white border-pink-100 text-gray-600"
                      }`}
                    >
                      <span>Knife (+ $1.00)</span>
                      <Plus className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => setAddGreetingCard(!addGreetingCard)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        addGreetingCard ? "bg-pink-500 border-pink-500 text-white" : "bg-white border-pink-100 text-gray-600"
                      }`}
                    >
                      <span>Gift Card (+ $3.00)</span>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {addGreetingCard && (
                    <Textarea
                      placeholder="Write message inside greeting card..."
                      value={cardMessage}
                      onChange={(e) => setCardMessage(e.target.value)}
                      className="mt-3 bg-pink-50/20 border-pink-100 focus-visible:ring-pink-500 rounded-xl"
                      rows={2}
                    />
                  )}
                </div>

                {/* 7. Delivery Schedule Slots */}
                <div className="space-y-4 border-t border-pink-50 pt-6">
                  <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-pink-500" /> Choose Delivery Date & Slot
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="delivery-date-input" className="text-xs text-gray-500">Date</Label>
                      <Input
                        id="delivery-date-input"
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="bg-pink-50/20 border-pink-100 focus-visible:ring-pink-500 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="delivery-slot" className="text-xs text-gray-500">Available Time Slot</Label>
                      <select
                        id="delivery-slot"
                        value={deliveryTimeSlot}
                        onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                        className="w-full text-xs font-semibold bg-pink-50/20 border border-pink-100 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-pink-400 text-gray-700"
                      >
                        <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                        <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                        <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                        <option value="Midnight Special (11:30 PM - 12:00 AM) (+ $5.00)">Midnight Special (11:30 PM - 12:00 AM) (+ $5.00)</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Purchase CTA */}
            <div className="pt-8 border-t border-pink-50 mt-8 flex flex-col sm:flex-row gap-4 items-center">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-pink-100 text-base"
              >
                <ShoppingBag className="h-5 w-5" /> Customize & Add to Cart
              </Button>
            </div>

          </div>

        </div>

        {/* Related Cakes Grid */}
        {relatedCakes.length > 0 && (
          <section className="mt-20 space-y-8">
            <div className="text-left space-y-2">
              <h3 className="text-2xl font-extrabold text-gray-900">You May Also Like</h3>
              <p className="text-xs text-gray-450 font-semibold">Matching options for your special event.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedCakes.map((c) => (
                <div key={c.id} className="bg-white p-2 rounded-3xl shadow-sm border border-pink-50">
                  <Link to={`/cake/${c.id}`}>
                    <div className="aspect-square overflow-hidden rounded-2xl bg-pink-50/20 mb-3">
                      <img src={c.image} alt={c.name} className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  </Link>
                  <div className="p-3 text-left space-y-1">
                    <Link to={`/cake/${c.id}`}>
                      <h4 className="font-bold text-gray-800 text-sm line-clamp-1 hover:text-pink-500 transition-colors">{c.name}</h4>
                    </Link>
                    <div className="text-xs text-pink-500 font-extrabold">${c.basePrice.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
