import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { ChevronRight, Search, Clock, ShieldCheck, MapPin, Truck, CheckCircle2, AlertCircle } from "lucide-react";

const TRACKING_STEPS = [
  { status: "pending", label: "Order Received", desc: "We received your order and are allocating a baking slot." },
  { status: "confirmed", label: "Order Confirmed", desc: "Payment verified. Baking slot is locked." },
  { status: "preparing", label: "Baking & Decoration", desc: "Our chefs are layering, frosting, and decorating your cake." },
  { status: "out_for_delivery", label: "Out for Delivery", desc: "Your cake is inside our temperature-controlled van on the way." },
  { status: "delivered", label: "Delivered", desc: "Delicious cake has been safely dropped off. Enjoy!" }
];

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get("id");

  const [searchQuery, setSearchQuery] = useState(idParam || "");
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idParam) {
      setActiveOrder(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch order from MongoDB public route by orderNumber
    axios.get(`${API_BASE_URL}/orders/${idParam.trim().toUpperCase()}`)
      .then((res) => {
        setActiveOrder(res.data?.data || null);
      })
      .catch((err) => {
        console.error(err);
        setActiveOrder(null);
        setError("Order not found or verification error.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [idParam]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.assign(`/track-order?id=${searchQuery.trim().replace("#", "").toUpperCase()}`);
    }
  };

  // Determine current step index
  const getCurrentStepIndex = () => {
    if (!activeOrder) return 0;
    const statusMap = {
      pending: 0,
      confirmed: 1,
      preparing: 2,
      baking: 2,
      out_for_delivery: 3,
      delivered: 4
    };
    return statusMap[activeOrder.orderStatus?.toLowerCase()] ?? 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground">Track Order Status</h1>
          <p className="text-sm text-muted-foreground">Monitor your custom cake's journey from our ovens to your doorstep.</p>
        </div>

        {/* Search Bar */}
        <div className="bg-card rounded-3xl border border-border shadow-sm p-6 max-w-xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter Order ID (e.g. ORD-123456)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary border-border focus-visible:ring-ring pl-10 rounded-xl"
              />
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary rounded-xl font-bold">
              Track
            </Button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-xs text-muted-foreground">Retrieving tracking records...</p>
          </div>
        )}

        {/* Tracking Details */}
        {!loading && activeOrder ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left: Stepper Timeline */}
            <div className="md:col-span-2 bg-card rounded-3xl border border-border shadow-sm p-6 text-left space-y-8">
              <h3 className="font-extrabold text-foreground text-lg border-b border-border pb-3 flex items-center gap-1.5">
                <Clock className="h-5 w-5 text-primary" /> Live Tracking Status
              </h3>

              {/* Progress Stepper */}
              <div className="relative pl-6 border-l-2 border-border space-y-10 ml-3">
                {TRACKING_STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  
                  return (
                    <div key={idx} className="relative">
                      {/* Circle Indicator */}
                      <span className={`absolute -left-[35px] top-0 h-6.5 w-6.5 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow-sm transition-colors ${
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : isCurrent
                          ? "bg-primary border-primary text-white animate-pulse"
                          : "bg-card border-border text-muted"
                      }`}>
                        {idx + 1}
                      </span>
                      
                      <div className="space-y-1 pl-4">
                        <h4 className={`font-bold text-sm sm:text-base ${isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Order Info Summary */}
            <aside className="space-y-6">
              <div className="bg-card rounded-3xl border border-border shadow-sm p-6 text-left space-y-5">
                <h3 className="font-extrabold text-foreground text-base border-b border-border pb-3">Order Details</h3>
                
                <div className="text-xs space-y-3 text-muted-foreground">
                  <div className="flex justify-between">
                    <span className="font-semibold">Order Reference:</span>
                    <span className="font-bold text-primary">#{activeOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Placed Date:</span>
                    <span className="font-bold text-foreground">
                      {new Date(activeOrder.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Grand Total:</span>
                    <span className="font-bold text-foreground">₹{activeOrder.grandTotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/50 pt-2 font-semibold">
                    <span>Payment Status:</span>
                    <span className={`uppercase font-bold ${activeOrder.paymentStatus === "paid" ? "text-green-600" : "text-amber-600"}`}>
                      {activeOrder.paymentStatus}
                    </span>
                  </div>
                </div>

                <hr className="border-border" />

                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" /> Delivery Address
                  </h4>
                  <p className="text-[10px] text-muted-foreground leading-normal pl-5">
                    {activeOrder.shippingAddress?.name} <br />
                    {activeOrder.shippingAddress?.street}, <br />
                    {activeOrder.shippingAddress?.city}, {activeOrder.shippingAddress?.state} - {activeOrder.shippingAddress?.zip} <br />
                    Phone: {activeOrder.shippingAddress?.phone}
                  </p>
                </div>

                {activeOrder.shippingAddress?.giftNote && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <h4 className="font-bold text-xs text-foreground">Gift Note Message</h4>
                    <p className="text-[10px] text-primary italic leading-normal pl-2 border-l border-border">
                      "{activeOrder.shippingAddress.giftNote}"
                    </p>
                  </div>
                )}
              </div>
            </aside>

          </div>
        ) : (
          !loading && (
            <div className="text-center py-20 bg-card rounded-3xl border border-border shadow-sm space-y-4 max-w-xl mx-auto">
              <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-extrabold text-foreground text-lg">No Active Orders Found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {error || "We couldn't locate any recent cake orders. Please enter a valid reference ID above."}
              </p>
            </div>
          )
        )}

      </div>
    </div>
  );
}
