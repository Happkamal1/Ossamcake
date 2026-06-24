import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ChevronLeft, CreditCard, Landmark, Truck, Heart, Gift } from "lucide-react";
import { toast } from "sonner";

export default function Checkout() {
  const { cartItems, subtotal, discountAmount, deliveryCharge, grandTotal, clearCart, coupon } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Wizard Steps: "form" -> "success"
  const [step, setStep] = useState("form");
  const [orderId, setOrderId] = useState("");

  // Delivery Form States
  const [address, setAddress] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : "",
    phone: user ? user.phone : "",
    street: user ? user.address.split(",")[0] : "",
    city: "New York",
    state: "NY",
    zip: "10001",
    giftNote: ""
  });

  // Payment States
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCardChange = (e) => {
    setCard((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!address.name || !address.phone || !address.street || !address.zip) {
      toast.error("Please fill in all required shipping fields!");
      return;
    }

    if (paymentMethod === "card" && (!card.number || !card.expiry || !card.cvv)) {
      toast.error("Please complete your card details!");
      return;
    }

    setLoading(true);

    // Simulate order placement API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const generatedId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedId);

    // Save order details to local storage so user can track it
    const activeOrders = JSON.parse(localStorage.getItem("cake_user_orders") || "[]");
    const newOrderRecord = {
      id: `#${generatedId}`,
      items: cartItems.map(item => ({ name: item.name, qty: item.quantity, price: item.price })),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      price: `$${grandTotal.toFixed(2)}`,
      status: "pending",
      address: `${address.street}, ${address.city}, ${address.state} ${address.zip}`,
      giftNote: address.giftNote
    };
    localStorage.setItem("cake_user_orders", JSON.stringify([newOrderRecord, ...activeOrders]));

    // Clear cart context
    clearCart();
    setStep("success");
    setLoading(false);
    toast.success("Order Placed Successfully!");
  };

  if (step === "success") {
    return (
      <div className="bg-[#FFF8F9] min-h-screen py-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-pink-50 shadow-xl max-w-lg w-full space-y-6">
          <div className="h-16 w-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Thank You For Your Order!</h2>
            <p className="text-sm text-gray-500">Your cake baking slot has been reserved successfully.</p>
          </div>

          <div className="bg-pink-50/50 rounded-2xl p-4 border border-pink-100/50 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-gray-700">
              <span>Order Reference ID:</span>
              <span className="text-pink-600">#{orderId}</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-normal">
              A invoice receipt with complete delivery instructions has been sent to your email.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="w-full bg-pink-500 hover:bg-pink-600 rounded-xl font-bold py-5">
              <Link to={`/track-order?id=${orderId}`}>Track Order Timeline</Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-pink-100 hover:bg-pink-50 text-pink-600 rounded-xl font-bold py-5">
              <Link to="/shop">Back to Shop</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF8F9] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link to="/cart" className="inline-flex items-center gap-1 text-xs text-pink-600 hover:text-pink-500 font-bold mb-8">
          <ChevronLeft className="h-4 w-4" /> Back to Cart
        </Link>

        <h1 className="text-3xl font-extrabold text-gray-900 text-left mb-10">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Columns: Forms */}
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSubmitOrder} className="space-y-8">
              
              {/* 1. Shipping Address */}
              <div className="bg-white rounded-3xl border border-pink-50 shadow-sm p-6 text-left space-y-4">
                <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2 border-b border-pink-50 pb-3">
                  <Truck className="h-5 w-5 text-pink-500" /> 1. Delivery Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Receiver's Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      value={address.name}
                      onChange={handleInputChange}
                      placeholder="E.g., Sarah Johnson"
                      className="bg-pink-50/20 border-pink-100 focus-visible:ring-pink-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Contact Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={address.phone}
                      onChange={handleInputChange}
                      placeholder="E.g., +1 (555) 123-4567"
                      className="bg-pink-50/20 border-pink-100 focus-visible:ring-pink-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    name="street"
                    required
                    value={address.street}
                    onChange={handleInputChange}
                    placeholder="E.g., Apt 4B, 123 Maple Street"
                    className="bg-pink-50/20 border-pink-100 focus-visible:ring-pink-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      required
                      value={address.city}
                      onChange={handleInputChange}
                      placeholder="New York"
                      className="bg-pink-50/20 border-pink-100 focus-visible:ring-pink-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      required
                      value={address.state}
                      onChange={handleInputChange}
                      placeholder="NY"
                      className="bg-pink-50/20 border-pink-100 focus-visible:ring-pink-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="zip">ZIP Code *</Label>
                    <Input
                      id="zip"
                      name="zip"
                      required
                      value={address.zip}
                      onChange={handleInputChange}
                      placeholder="10001"
                      className="bg-pink-50/20 border-pink-100 focus-visible:ring-pink-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="giftNote" className="flex items-center gap-1.5">
                    <Gift className="h-4 w-4 text-pink-500" /> Gift Message / Special Delivery Note
                  </Label>
                  <Textarea
                    id="giftNote"
                    name="giftNote"
                    value={address.giftNote}
                    onChange={handleInputChange}
                    placeholder="Write a lovely note to print on a greeting card or delivery instructions (e.g., Leave with doorman)."
                    rows={3}
                    className="bg-pink-50/20 border-pink-100 focus-visible:ring-pink-500"
                  />
                </div>
              </div>

              {/* 2. Payment Method */}
              <div className="bg-white rounded-3xl border border-pink-50 shadow-sm p-6 text-left space-y-6">
                <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2 border-b border-pink-50 pb-3">
                  <CreditCard className="h-5 w-5 text-pink-500" /> 2. Payment Options
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-4 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === "card"
                        ? "bg-pink-500 border-pink-500 text-white font-bold shadow-md shadow-pink-100"
                        : "bg-white border-pink-100 text-gray-650"
                    }`}
                  >
                    <CreditCard className="h-5 w-5" /> Credit or Debit Card
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-4 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === "cod"
                        ? "bg-pink-500 border-pink-500 text-white font-bold shadow-md shadow-pink-100"
                        : "bg-white border-pink-100 text-gray-650"
                    }`}
                  >
                    <Landmark className="h-5 w-5" /> Cash on Delivery (COD)
                  </button>
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-4 pt-4 border-t border-pink-50/50">
                    <div className="space-y-1.5">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="number"
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        value={card.number}
                        onChange={handleCardChange}
                        className="bg-pink-50/20 border-pink-100 focus-visible:ring-pink-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="cardExpiry">Expiration Date</Label>
                        <Input
                          id="cardExpiry"
                          name="expiry"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={card.expiry}
                          onChange={handleCardChange}
                          className="bg-pink-50/20 border-pink-100 focus-visible:ring-pink-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cardCvv">CVV Code</Label>
                        <Input
                          id="cardCvv"
                          name="cvv"
                          type="password"
                          placeholder="•••"
                          maxLength={3}
                          value={card.cvv}
                          onChange={handleCardChange}
                          className="bg-pink-50/20 border-pink-100 focus-visible:ring-pink-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <p className="text-[10px] text-gray-400 bg-pink-50/25 p-3.5 rounded-xl border border-pink-100/50 leading-relaxed text-center">
                    📢 Please keep exact change ready. A delivery agent will collect a cash payment of <strong>${grandTotal.toFixed(2)}</strong> at your doorstep.
                  </p>
                )}
              </div>

            </form>
          </div>

          {/* Right Column: Checkout Pricing Summary */}
          <aside className="space-y-6">
            <div className="bg-white rounded-3xl border border-pink-50 shadow-sm p-6 text-left space-y-6">
              <h3 className="font-bold text-gray-900 text-lg border-b border-pink-50 pb-3">Checkout Summary</h3>

              {/* Items listing */}
              <div className="max-h-40 overflow-y-auto space-y-3 pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-gray-800 line-clamp-1">{item.name}</span>
                      <span className="text-[10px] text-gray-400">{item.flavor} ({item.weight}) &times; {item.quantity}</span>
                    </div>
                    <span className="font-extrabold text-pink-500 shrink-0">
                      ${(item.price * (1 - (item.discount || 0)/100) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-pink-50" />

              <div className="space-y-3 text-xs text-gray-650">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({coupon.code})</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-gray-900">
                    {deliveryCharge === 0 ? "FREE" : `$${deliveryCharge.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <hr className="border-pink-50" />

              <div className="flex justify-between text-base font-black text-gray-900">
                <span>Grand Total</span>
                <span className="text-pink-500">${grandTotal.toFixed(2)}</span>
              </div>

              <Button
                onClick={handleSubmitOrder}
                disabled={loading}
                className="w-full bg-pink-500 hover:bg-pink-650 text-white font-bold py-6 rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-pink-100 text-base"
              >
                {loading ? "Processing Order..." : "Place Custom Order"}
              </Button>
            </div>
          </aside>
        </div>

      </div>
    </div>
  );
}
