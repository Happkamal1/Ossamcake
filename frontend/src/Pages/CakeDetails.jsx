import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductBySlug, fetchProductById, clearSelectedProduct } from "@/features/products/productSlice";
import { fetchReviews, createReview, updateReview, deleteReview } from "@/features/reviews/reviewSlice";
import { useAuth } from "@/context/AuthContext";
import { productApi } from "@/features/products/productApi";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Edit2, Trash } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Heart,
  Star,
  Sparkles,
  Calendar,
  Clock,
  MessageSquare,
  Upload,
  Plus,
  HelpCircle,
  TrendingUp,
  MapPin,
  Share2,
  CheckCircle2,
  XCircle,
  X
} from "lucide-react";
import ProductCard from "@/components/product/ProductCard";

const VALID_PINCODES = ["10001", "10002", "400001", "400002", "110001", "560001"];

export default function CakeDetails() {
  const { id: slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const { selectedProduct: cake, loading, error } = useSelector((state) => state.products);
  const { user } = useAuth();
  const { items: reviews, breakdown, loading: reviewsLoading } = useSelector((state) => state.reviews);
  const [relatedCakes, setRelatedCakes] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

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

  // Reviews & Comments States
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Active view image (supporting small gallery)
  const [activeImage, setActiveImage] = useState("");
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Pincode Availability States
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState("idle"); // idle | checking | available | unavailable

  useEffect(() => {
    // If the slug parameter matches the shape of a MongoDB ObjectId (24 hex characters), fetch by ID.
    // Otherwise, fetch by URL slug.
    if (/^[0-9a-fA-F]{24}$/.test(slug)) {
      dispatch(fetchProductById(slug));
    } else {
      dispatch(fetchProductBySlug(slug));
    }
    
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, slug]);

  // Load Recently Viewed list from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cake_recently_viewed");
      if (saved) {
        setRecentlyViewed(JSON.parse(saved));
      }
    } catch (err) {
      console.error(err);
    }
  }, [slug]);

  useEffect(() => {
    if (cake) {
      // Default to first variant
      setSelectedVariant(cake.variants?.[0] || { flavor: "Classic", size: "1 kg", price: cake.basePrice });
      setActiveImage(cake.image || cake.thumbnail);

      // Fetch reviews for this product
      dispatch(fetchReviews({ productId: cake._id }));

      // Load related products based on categories/cakeTypes dynamically from backend
      productApi.getRelated(cake._id, 4)
        .then((res) => {
          setRelatedCakes(res.data?.data || []);
        })
        .catch((err) => console.error("Error loading related:", err));

      // Update Recently Viewed history
      try {
        const itemToSave = {
          id: cake.slug || cake._id,
          slug: cake.slug || cake._id,
          name: cake.name,
          image: cake.image || cake.thumbnail,
          basePrice: cake.basePrice,
          rating: cake.rating,
          reviewsCount: cake.reviewsCount,
          discount: cake.discount || 0
        };

        const existing = JSON.parse(localStorage.getItem("cake_recently_viewed") || "[]");
        const filtered = existing.filter((item) => item.id !== itemToSave.id);
        const updated = [itemToSave, ...filtered].slice(0, 4);
        
        localStorage.setItem("cake_recently_viewed", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save recently viewed:", err);
      }
    }
  }, [cake]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-background py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading sweet details...</p>
      </div>
    );
  }

  if (error || !cake) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-background py-12">
        <h2 className="text-2xl font-extrabold text-foreground mb-4">Cake Not Found</h2>
        <p className="text-muted-foreground mb-6">The sweet creation you are looking for does not exist or has been eaten!</p>
        <Button asChild className="bg-primary hover:bg-primary rounded-full font-bold">
          <Link to="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  // Price calculations based on variants and options
  const isWishlisted = isInWishlist(cake.slug || cake.id);
  const discountRate = cake.discount || 0;
  const rawPrice = selectedVariant ? selectedVariant.price : cake.basePrice;
  const discountVal = (rawPrice * discountRate) / 100;
  
  // Extra options cost
  let extrasCost = 0;
  if (isEggless) extrasCost += (cake.egglessPremium || 50); // standard Indian rupee premium
  if (addCandles) extrasCost += 15;
  if (addKnife) extrasCost += 10;
  if (addGreetingCard) extrasCost += 30;

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

  const checkPincode = (e) => {
    e.preventDefault();
    if (!pincode.trim()) return;

    setPincodeStatus("checking");
    setTimeout(() => {
      if (VALID_PINCODES.includes(pincode.trim())) {
        setPincodeStatus("available");
        toast.success(`We deliver to ${pincode}! Same-day delivery available.`);
      } else {
        setPincodeStatus("unavailable");
        toast.error(`Sorry, delivery is not available for ${pincode} currently.`);
      }
    }, 800);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Product link copied to clipboard!");
  };

  const getCustomizationPayload = () => {
    return {
      cakeId: cake._id,
      name: cake.name,
      image: cake.image || cake.thumbnail,
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
  };

  const handleAddToCart = () => {
    if (!deliveryDate) {
      toast.error("Please choose a Delivery Date before adding to cart!");
      document.getElementById("delivery-date-input")?.focus();
      return;
    }

    addToCart(getCustomizationPayload());
    toast.success(`${cake.name} added to cart!`, {
      action: {
        label: "Checkout Now",
        onClick: () => navigate("/cart")
      }
    });
  };

  const handleBuyNow = async () => {
    if (!deliveryDate) {
      toast.error("Please choose a Delivery Date before purchasing!");
      document.getElementById("delivery-date-input")?.focus();
      return;
    }

    // Add to cart, wait for dispatch completion, then redirect
    await addToCart(getCustomizationPayload());
    toast.success("Preparing your checkout summary...");
    navigate("/checkout");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit a review.", {
        action: {
          label: "Login",
          onClick: () => navigate(`/login?redirect=/cake/${slug}`)
        }
      });
      return;
    }

    if (newRating < 1 || newRating > 5) {
      toast.error("Please select a rating between 1 and 5 stars.");
      return;
    }

    setSubmittingReview(true);
    try {
      if (editingReviewId) {
        await dispatch(updateReview({ reviewId: editingReviewId, reviewData: { rating: newRating, comment: newComment } })).unwrap();
        toast.success("Review updated successfully!");
        setEditingReviewId(null);
      } else {
        await dispatch(createReview({ productId: cake._id, reviewData: { rating: newRating, comment: newComment } })).unwrap();
        toast.success("Review submitted successfully!");
      }
      setNewComment("");
      setNewRating(5);
    } catch (err) {
      toast.error(err || "Failed to submit review. Note: Only 1 review per product allowed.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete your review?")) {
      try {
        await dispatch(deleteReview(reviewId)).unwrap();
        toast.success("Review deleted successfully.");
      } catch (err) {
        toast.error(err || "Failed to delete review.");
      }
    }
  };

  const handleEditInit = (review) => {
    setEditingReviewId(review._id);
    setNewRating(review.rating);
    setNewComment(review.comment);
    document.getElementById("review-form-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Product Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
          
          {/* Left Column: Image Gallery & Previews */}
          <div className="space-y-6">
            <div 
              onClick={() => setIsZoomOpen(true)}
              className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary group cursor-zoom-in"
            >
              <img
                src={activeImage}
                alt={cake.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              {/* Floating Discount Tag */}
              {discountRate > 0 && (
                <span className="absolute top-4 left-4 bg-primary text-white font-extrabold px-3 py-1 rounded-full text-xs shadow-md">
                  {discountRate}% SPECIAL OFF
                </span>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveImage(cake.image || cake.thumbnail)}
                className={`h-20 w-20 rounded-xl overflow-hidden border-2 shrink-0 bg-secondary ${
                  activeImage === (cake.image || cake.thumbnail) ? "border-primary" : "border-border"
                }`}
              >
                <img src={cake.image || cake.thumbnail} alt={cake.name} className="h-full w-full object-cover" />
              </button>
              
              {/* Gallery Images */}
              {cake.gallery?.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`h-20 w-20 rounded-xl overflow-hidden border-2 shrink-0 bg-secondary ${
                    activeImage === img ? "border-primary" : "border-border"
                  }`}
                >
                  <img src={img} alt="gallery thumbnail" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>

            {/* Trust factors */}
            <div className="p-4 rounded-2xl bg-secondary border border-border grid grid-cols-2 gap-4 text-xs text-muted-foreground text-left">
              <div>🎂 <strong>100% Eggless Option:</strong> Fresh eggless substitute available.</div>
              <div>🚚 <strong>Safely Transported:</strong> Shipped in cold-storage vans.</div>
            </div>
          </div>

          {/* Right Column: Customization Forms */}
          <div className="space-y-6 text-left flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Breadcrumb category */}
              <div className="text-xs font-bold text-primary uppercase tracking-widest flex items-center justify-between">
                <span>{cake.categories?.map(c => c.name || c).join("  |  ")}</span>
                
                <div className="flex gap-2">
                  {/* Share button */}
                  <button 
                    onClick={handleShare}
                    className="p-2 rounded-full border border-border bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground shadow-sm transition"
                    title="Share product link"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>

                  {/* Wishlist toggle */}
                  <button
                    onClick={() => toggleWishlist(cake.slug || cake.id)}
                    className={`p-2 rounded-full border shadow-sm transition-all focus:outline-none ${
                      isWishlisted
                        ? "bg-primary border-primary text-white"
                        : "bg-secondary border-border text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
                {cake.name}
              </h1>

              {/* Price Details */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-foreground">
                  ₹{finalUnitPrice.toFixed(2)}
                </span>
                {discountRate > 0 && (
                  <>
                    <span className="text-sm font-semibold text-muted-foreground line-through">
                      ₹{rawPrice.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      Save ₹{discountVal.toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {cake.description}
              </p>

              {/* Pincode availability check block */}
              <div className="p-4 bg-secondary/50 rounded-2xl border border-border space-y-3">
                <Label htmlFor="pincode" className="text-xs font-bold text-foreground">Check Delivery Pincode</Label>
                <form onSubmit={checkPincode} className="flex gap-2">
                  <Input 
                    id="pincode"
                    type="text" 
                    placeholder="Enter delivery pincode (e.g. 400001)"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength={6}
                    className="bg-card border-border rounded-xl text-xs"
                  />
                  <Button type="submit" size="sm" className="bg-primary hover:bg-primary font-bold text-xs rounded-xl">
                    Check
                  </Button>
                </form>

                {pincodeStatus === "checking" && <div className="text-xs text-muted-foreground animate-pulse">Verifying delivery codes...</div>}
                {pincodeStatus === "available" && (
                  <div className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Cake delivery available at this location!
                  </div>
                )}
                {pincodeStatus === "unavailable" && (
                  <div className="text-xs text-destructive font-semibold flex items-center gap-1">
                    <XCircle className="h-4 w-4" /> Sorry, we don't deliver cakes here yet.
                  </div>
                )}
              </div>

              {/* 1. Size & Variant Selection */}
              <div className="space-y-2.5 pt-2">
                <Label className="text-xs font-extrabold uppercase tracking-wide text-foreground">Select Weight / Flavor Variant *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {cake.variants?.map((v, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 border rounded-xl text-left transition-all focus:outline-none ${
                        selectedVariant?.flavor === v.flavor && selectedVariant?.size === v.size
                          ? "border-primary bg-primary/5 text-primary shadow-sm"
                          : "border-border bg-card text-foreground hover:bg-secondary"
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{v.flavor}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{v.size} — ₹{v.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Egg/Eggless Selector */}
              {cake.egglessAvailable && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary border border-border">
                  <div className="text-left">
                    <div className="text-xs font-extrabold text-foreground">Make it 100% Eggless</div>
                    <div className="text-[10px] text-muted-foreground">Fluffy egg-substitute (Add ₹{cake.egglessPremium || 50})</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isEggless}
                    onChange={(e) => setIsEggless(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                </div>
              )}

              {/* 3. Message on Cake */}
              <div className="space-y-2 pt-2">
                <Label className="text-xs font-extrabold uppercase tracking-wide text-foreground">Message on Cake (Max 25 chars)</Label>
                <Input
                  maxLength={25}
                  value={cakeMessage}
                  onChange={(e) => setCakeMessage(e.target.value)}
                  placeholder="e.g. Happy Birthday John"
                  className="bg-card border-border"
                />
              </div>

              {/* 4. Scheduling Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2 text-left">
                  <Label htmlFor="delivery-date-input" className="text-xs font-extrabold uppercase tracking-wide text-foreground">Delivery Date *</Label>
                  <Input
                    id="delivery-date-input"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="bg-card border-border text-xs"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <Label className="text-xs font-extrabold uppercase tracking-wide text-foreground">Delivery Slot *</Label>
                  <select
                    value={deliveryTimeSlot}
                    onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                    className="w-full text-xs font-semibold bg-card border border-border rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                  >
                    <option>Morning (9 AM - 12 PM)</option>
                    <option>Afternoon (12 PM - 4 PM)</option>
                    <option>Evening (4 PM - 8 PM)</option>
                    <option>Night Delivery (8 PM - 11 PM) (+ ₹150)</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="pt-6 grid grid-cols-2 gap-4">
              <Button 
                onClick={handleAddToCart} 
                variant="outline"
                className="w-full border-primary hover:bg-primary/5 text-primary font-bold rounded-xl h-12 shadow-sm"
              >
                Add to Cart
              </Button>
              <Button 
                onClick={handleBuyNow} 
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold rounded-xl h-12 shadow-lg shadow-primary/20"
              >
                Buy Now
              </Button>
            </div>

          </div>
        </div>

        {/* Related Products Slider */}
        {relatedCakes.length > 0 && (
          <div className="pt-16 space-y-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-extrabold text-foreground">You May Also Like</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedCakes.map((c) => (
                <ProductCard key={c.id} cake={c} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed Slider */}
        {recentlyViewed.length > 0 && (
          <div className="pt-16 space-y-6 border-t border-border mt-16 pb-16">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-extrabold text-foreground">Recently Viewed Cakes</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recentlyViewed.map((c) => (
                <ProductCard key={c.id} cake={c} />
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* REVIEWS & COMMENTS SECTION */}
        {/* ==================================================== */}
        <div className="pt-16 border-t border-border space-y-12 text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
            <div>
              <h3 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
                <Star className="h-6 w-6 text-amber-500 fill-current" /> Customer Feedback & Reviews
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Read reviews left by verified purchasers of this cake.</p>
            </div>
            <a 
              href="#review-form-section" 
              className="inline-flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 text-primary px-4 py-2.5 text-xs font-bold transition duration-250"
            >
              Write a Review
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Stats & Breakdown */}
            <div className="space-y-6">
              <div className="bg-secondary/20 rounded-3xl p-6 border border-border/60 text-center space-y-4">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">Average Rating</h4>
                <div className="text-5xl font-black text-foreground">{(cake?.rating || 0).toFixed(1)}</div>
                
                <div className="flex justify-center text-amber-500 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < Math.floor(cake?.rating || 0) ? "fill-current" : "text-muted"}`} 
                    />
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">
                  Based on {reviews.length} total rating{reviews.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Star Progress Bars */}
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = breakdown[stars] || 0;
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

                  return (
                    <div key={stars} className="flex items-center gap-3 text-xs font-medium">
                      <span className="w-12 text-foreground font-semibold flex items-center gap-1 justify-end">
                        {stars} <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
                      </span>
                      <div className="flex-1 bg-secondary rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-muted-foreground text-left font-bold">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Review List & Submission Form */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Review List */}
              <div className="space-y-6">
                <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
                  Latest Comments ({reviews.length})
                </h4>

                {reviewsLoading && reviews.length === 0 ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse bg-secondary/30 rounded-2xl p-5 border border-border space-y-3">
                        <div className="h-4 w-1/4 bg-border rounded" />
                        <div className="h-3 w-3/4 bg-border rounded" />
                      </div>
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="border border-dashed border-border rounded-3xl p-8 text-center bg-card text-muted-foreground">
                    <Star className="h-10 w-10 text-muted/40 mx-auto mb-2" />
                    <p className="text-sm font-bold">No reviews submitted yet</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Be the first to share your experience with this custom cake flavor!</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {reviews.map((review) => {
                      const isOwnReview = user?._id === review.user?._id;
                      
                      return (
                        <div key={review._id} className="bg-card border border-border p-5 rounded-2xl space-y-3 relative hover:shadow-sm transition-shadow text-left">
                          
                          {/* User Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 overflow-hidden flex-shrink-0">
                                {review.user?.profileImage ? (
                                  <img 
                                    src={review.user.profileImage.startsWith("http") ? review.user.profileImage : `http://localhost:5000${review.user.profileImage}`} 
                                    alt={review.user?.name} 
                                    className="h-full w-full object-cover" 
                                  />
                                ) : (
                                  review.user?.name ? review.user.name[0].toUpperCase() : "?"
                                )}
                              </div>
                              <div>
                                <h5 className="font-bold text-foreground text-xs">{review.user?.name || "Verified Customer"}</h5>
                                <p className="text-[10px] text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </p>
                              </div>
                            </div>

                            {/* Stars rating */}
                            <div className="flex text-amber-500 gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3 w-3 ${i < review.rating ? "fill-current" : "text-muted"}`} 
                                />
                              ))}
                            </div>
                          </div>

                          {/* Comment details */}
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {review.comment}
                          </p>

                          {/* Edit / Delete Buttons if owner */}
                          {isOwnReview && (
                            <div className="flex items-center justify-end gap-3 pt-1 border-t border-border/50">
                              <button 
                                onClick={() => handleEditInit(review)}
                                className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 className="h-3 w-3" /> Edit
                              </button>
                              <button 
                                onClick={() => handleReviewDelete(review._id)}
                                className="text-[10px] font-bold text-destructive hover:text-destructive/80 flex items-center gap-1 cursor-pointer"
                              >
                                <Trash className="h-3 w-3" /> Delete
                              </button>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Review Submit Form */}
              <div id="review-form-section" className="bg-secondary/10 border border-border p-6 rounded-3xl space-y-4">
                <div>
                  <h4 className="text-base font-extrabold text-foreground">
                    {editingReviewId ? "Edit Your Review" : "Write a Review"}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Share your feedback about this custom cake to help other dessert lovers.</p>
                </div>

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Interactive Star Picker */}
                  <div className="space-y-1.5 text-left">
                    <Label className="text-xs font-bold text-foreground">Your Rating</Label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((stars) => (
                        <button
                          key={stars}
                          type="button"
                          onClick={() => setNewRating(stars)}
                          className="focus:outline-none hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star 
                            className={`h-7 w-7 transition-colors ${
                              stars <= newRating ? "text-amber-500 fill-current" : "text-muted hover:text-amber-400"
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Textarea */}
                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="review-comment-input" className="text-xs font-bold text-foreground font-semibold">Your Review Details</Label>
                    <textarea
                      id="review-comment-input"
                      rows={4}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="What did you think of the flavor, texture, decorations, and delivery?"
                      className="w-full bg-card border border-border focus:ring-1 focus:ring-primary focus:outline-none rounded-xl p-3 text-xs leading-relaxed"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-2">
                    {editingReviewId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingReviewId(null);
                          setNewComment("");
                          setNewRating(5);
                        }}
                        className="rounded-xl font-bold h-10 border-border text-xs"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-primary hover:bg-primary/95 font-bold h-10 px-6 text-xs rounded-xl"
                    >
                      {submittingReview ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : editingReviewId ? (
                        "Update Review"
                      ) : (
                        "Submit Review"
                      )}
                    </Button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Premium Image Zoom Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <button 
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition duration-200"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="max-w-4xl max-h-[90vh] p-4">
            <img 
              src={activeImage} 
              alt={cake.name} 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl scale-in"
            />
          </div>
        </div>
      )}
    </div>
  );
}
