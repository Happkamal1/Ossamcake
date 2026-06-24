import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, Search, Clock, ShieldCheck, MapPin, Truck, CheckCircle2 } from "lucide-react";

const TRACKING_STEPS = [
  { status: "pending", label: "Order Received", desc: "We received your order and are allocating a baking slot." },
  { status: "preparing", label: "Baking & Decoration", desc: "Our chefs are layering, frosting, and decorating your cake." },
  { status: "shipped", label: "Out for Delivery", desc: "Your cake is inside our temperature-controlled van on the way." },
  { status: "delivered", label: "Delivered", desc: "Delicious cake has been safely dropped off. Enjoy!" }
];

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get("id");

  const [searchQuery, setSearchQuery] = useState(idParam || "");
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    // Load orders from LocalStorage
    const savedOrders = JSON.parse(localStorage.getItem("cake_user_orders") || "[]");
    
    if (idParam) {
      const found = savedOrders.find(
        (o) => o.id.replace("#", "").toUpperCase() === idParam.trim().toUpperCase()
      );
      if (found) {
        setActiveOrder(found);
      } else {
        // Fallback mock order if ID was randomized
        setActiveOrder({
          id: `#${idParam}`,
          items: [{ name: "Signature Ariston Chocolate Cake", qty: 1, price: "$59.99" }],
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          price: "$59.99",
          status: "preparing",
          address: "123 Maple Street, New York, NY 10001",
          giftNote: "Happy Birthday!"
        });
      }
    } else if (savedOrders.length > 0) {
      // Default to showing latest order
      setActiveOrder(savedOrders[0]);
    }
  }, [idParam]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.assign(`/track-order?id=${searchQuery.trim().replace("#", "")}`);
    }
  };

  // Determine current step index
  const getCurrentStepIndex = () => {
    if (!activeOrder) return 0;
    const statusMap = {
      pending: 0,
      preparing: 1,
      processing: 1,
      shipped: 2,
      out_for_delivery: 2,
      delivered: 3
    };
    return statusMap[activeOrder.status.toLowerCase()] ?? 1;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="bg-[#FFF8F9] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900">Track Order Status</h1>
          <p className="text-sm text-gray-500">Monitor your custom cake's journey from our ovens to your doorstep.</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-3xl border border-pink-50 shadow-sm p-6 max-w-xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Enter 6-digit Order ID (e.g. ORD-123456)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-pink-50/20 border-pink-100 focus-visible:ring-pink-500 pl-10 rounded-xl"
              />
            </div>
            <Button type="submit" className="bg-pink-500 hover:bg-pink-600 rounded-xl font-bold">
              Track
            </Button>
          </form>
        </div>

        {/* Tracking Details */}
        {activeOrder ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left: Stepper Timeline */}
            <div className="md:col-span-2 bg-white rounded-3xl border border-pink-50 shadow-sm p-6 text-left space-y-8">
              <h3 className="font-extrabold text-gray-900 text-lg border-b border-pink-50 pb-3 flex items-center gap-1.5">
                <Clock className="h-5 w-5 text-pink-500" /> Live Tracking Status
              </h3>

              {/* Progress Stepper */}
              <div className="relative pl-6 border-l-2 border-pink-100/70 space-y-10 ml-3">
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
                          ? "bg-pink-500 border-pink-500 text-white animate-pulse"
                          : "bg-white border-pink-150 text-gray-300"
                      }`}>
                        {idx + 1}
                      </span>
                      
                      <div className="space-y-1 pl-4">
                        <h4 className={`font-bold text-sm sm:text-base ${isCurrent ? "text-pink-600" : isCompleted ? "text-gray-800" : "text-gray-450"}`}>
                          {step.label}
                        </h4>
                        <p className="text-xs text-gray-450 leading-relaxed font-normal">
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
              <div className="bg-white rounded-3xl border border-pink-50 shadow-sm p-6 text-left space-y-5">
                <h3 className="font-extrabold text-gray-900 text-base border-b border-pink-50 pb-3">Order Details</h3>
                
                <div className="text-xs space-y-3 text-gray-650">
                  <div className="flex justify-between">
                    <span className="font-semibold">Order Reference:</span>
                    <span className="font-bold text-pink-500">{activeOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Placed Date:</span>
                    <span className="font-bold text-gray-800">{activeOrder.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Price:</span>
                    <span className="font-bold text-gray-800">{activeOrder.price}</span>
                  </div>
                </div>

                <hr className="border-pink-50" />

                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-pink-500" /> Delivery Address
                  </h4>
                  <p className="text-[10px] text-gray-500 leading-normal pl-5">
                    {activeOrder.address}
                  </p>
                </div>

                {activeOrder.giftNote && (
                  <div className="space-y-2 pt-2 border-t border-pink-50/50">
                    <h4 className="font-bold text-xs text-gray-800">Gift Note Message</h4>
                    <p className="text-[10px] text-pink-600 italic leading-normal pl-2 border-l border-pink-200">
                      "{activeOrder.giftNote}"
                    </p>
                  </div>
                )}
              </div>
            </aside>

          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-pink-50 shadow-sm space-y-4 max-w-xl mx-auto">
            <div className="h-16 w-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto">
              <Search className="h-6 w-6 text-pink-400" />
            </div>
            <h3 className="font-extrabold text-gray-800 text-lg">No Active Orders Found</h3>
            <p className="text-sm text-gray-450 max-w-sm mx-auto">
              We couldn't locate any recent cake orders. Please enter a valid 6-digit reference ID above.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
