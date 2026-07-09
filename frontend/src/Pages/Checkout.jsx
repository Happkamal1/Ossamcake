import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import {
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Landmark,
  Truck,
  Gift,
  FileText,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  AlertTriangle,
  X
} from "lucide-react";
import { toast } from "sonner";

export default function Checkout() {
  const { cartItems, getCart, subtotal, discountAmount, deliveryCharge, grandTotal, clearCart, coupon } = useCart();
  const navigate = useNavigate();

  // Wizard Steps: "form" -> "success" | "failed"
  const [step, setStep] = useState("form");
  const [orderId, setOrderId] = useState("");
  
  // Addresses States
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    mobileNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "Mumbai",
    state: "Maharashtra",
    zip: "400001",
    landmark: "",
  });
  
  // Scheduling & Delivery details
  const [giftNote, setGiftNote] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("Afternoon (12 PM - 4 PM)");

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "" });

  // Invoice Preview State
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [tempOrderNumber, setTempOrderNumber] = useState("");

  // Loading States
  const [loading, setLoading] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentOrderInfo, setPaymentOrderInfo] = useState(null);

  // Load cart and saved addresses on mount
  useEffect(() => {
    getCart();
    axios.get("http://localhost:5000/api/v1/users/addresses", { withCredentials: true })
      .then((res) => {
        const addresses = res.data?.data || [];
        setSavedAddresses(addresses);
        const def = addresses.find(a => a.isDefault);
        if (def) setSelectedAddressId(def._id);
        else if (addresses.length > 0) setSelectedAddressId(addresses[0]._id);
      })
      .catch((err) => console.error("Error loading addresses:", err));
    
    // Generate temporary preview order number
    const tempNum = `TEMP-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    setTempOrderNumber(tempNum);
  }, []);

  // Sync date from cart items if available
  useEffect(() => {
    if (cartItems.length > 0) {
      const scheduledItem = cartItems.find((i) => i.deliveryDate);
      if (scheduledItem) {
        setDeliveryDate(scheduledItem.deliveryDate);
        setDeliveryTimeSlot(scheduledItem.deliveryTimeSlot);
      }
    }
  }, [cartItems]);

  const handleInputChange = (e) => {
    setNewAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getShippingPayload = () => {
    if (selectedAddressId && selectedAddressId !== "new") {
      const addr = savedAddresses.find((a) => a._id === selectedAddressId);
      if (addr) {
        return {
          name: addr.fullName,
          phone: addr.mobileNumber,
          street: addr.addressLine2 ? `${addr.addressLine1}, ${addr.addressLine2}` : addr.addressLine1,
          city: addr.city,
          state: addr.state,
          zip: addr.pincode,
          giftNote,
        };
      }
    }
    return {
      name: newAddress.fullName,
      phone: newAddress.mobileNumber,
      street: newAddress.addressLine2 ? `${newAddress.addressLine1}, ${newAddress.addressLine2}` : newAddress.addressLine1,
      city: newAddress.city,
      state: newAddress.state,
      zip: newAddress.zip,
      giftNote,
    };
  };

  const validateDetails = () => {
    const shipping = getShippingPayload();
    if (!shipping.name || !shipping.phone || !shipping.street || !shipping.zip) {
      toast.error("Please provide complete delivery details!");
      return false;
    }
    if (!deliveryDate) {
      toast.error("Please choose a Delivery Date!");
      return false;
    }
    if (paymentMethod === "card" && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      toast.error("Please complete your card details!");
      return false;
    }
    return true;
  };

  const handleOpenInvoice = () => {
    if (validateDetails()) {
      setIsInvoiceOpen(true);
    }
  };

  const handlePlaceOrder = async () => {
    setIsInvoiceOpen(false);
    setLoading(true);

    const shipping = getShippingPayload();

    try {
      // 1. Post to placeOrder endpoint
      const response = await axios.post(
        "http://localhost:5000/api/v1/orders",
        {
          shippingAddress: shipping,
          paymentMethod,
        },
        { withCredentials: true }
      );

      const responseData = response.data?.data;

      // Case A: COD (Confirmed immediately)
      if (paymentMethod === "cod") {
        setOrderId(responseData.orderNumber);
        clearCart();
        setStep("success");
        toast.success("Order Placed Successfully!");
      } 
      // Case B: Online Payments (UPI / Card)
      else {
        setPaymentOrderInfo(responseData);
        setPaymentModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to initiate order placement.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async (success) => {
    setPaymentModalOpen(false);
    setLoading(true);

    const { paymentOrder, order } = paymentOrderInfo;
    const razorpay_order_id = paymentOrder.id;
    const razorpay_payment_id = `pay_simulated_${Date.now()}`;
    const razorpay_signature = success ? "simulated_success" : "simulated_failure";

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/payment/verify",
        {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        },
        { withCredentials: true }
      );

      if (success) {
        setOrderId(order.orderNumber);
        clearCart();
        setStep("success");
        toast.success("Payment verified! Order confirmed.");
      } else {
        setStep("failed");
        toast.error("Payment failed. Please retry.");
      }
    } catch (err) {
      console.error(err);
      setStep("failed");
      toast.error("Payment verification failed.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && step === "form") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-background py-12 px-4 text-center">
        <h2 className="text-2xl font-extrabold text-foreground mb-4">No Items for Checkout</h2>
        <p className="text-muted-foreground mb-8">Please add cakes to your cart before proceeding.</p>
        <Button asChild className="bg-primary hover:bg-primary rounded-full font-bold px-8 py-5">
          <Link to="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  // Render Order Success Panel
  if (step === "success") {
    return (
      <div className="bg-background min-h-screen py-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="bg-card p-8 sm:p-12 rounded-3xl border border-border shadow-xl max-w-lg w-full space-y-6">
          <div className="h-16 w-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Thank You For Your Order!</h2>
            <p className="text-sm text-muted-foreground">Your cake baking slot has been reserved successfully.</p>
          </div>

          <div className="bg-secondary rounded-2xl p-4 border border-border space-y-2 text-xs text-left">
            <div className="flex justify-between font-bold text-foreground">
              <span>Order Reference ID:</span>
              <span className="text-primary font-black">#{orderId}</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-normal">
              An invoice receipt with complete delivery instructions has been generated in our system. You can monitor progress timeline below.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="w-full bg-primary hover:bg-primary rounded-xl font-bold py-5">
              <Link to={`/track-order?id=${orderId}`}>Track Order Timeline</Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-border hover:bg-secondary text-primary rounded-xl font-bold py-5">
              <Link to="/shop">Back to Shop</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render Order Failed Panel
  if (step === "failed") {
    return (
      <div className="bg-background min-h-screen py-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="bg-card p-8 sm:p-12 rounded-3xl border border-border shadow-xl max-w-lg w-full space-y-6">
          <div className="h-16 w-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="h-10 w-10" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Payment Verification Failed</h2>
            <p className="text-sm text-muted-foreground">We did not receive confirmation of your payment transaction.</p>
          </div>

          <p className="text-xs text-muted-foreground">
            Don't worry, your cart remains unchanged. You can try checkout again with a different payment method or attempt the payment transaction once more.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setStep("form")} className="w-full bg-primary hover:bg-primary rounded-xl font-bold py-5">
              Retry Checkout
            </Button>
            <Button asChild variant="outline" className="w-full border-border hover:bg-secondary text-primary rounded-xl font-bold py-5">
              <Link to="/cart">Modify Cart</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const selectedShipping = getShippingPayload();

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link to="/cart" className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary font-bold mb-8">
          <ChevronLeft className="h-4 w-4" /> Back to Cart
        </Link>

        <h1 className="text-3xl font-extrabold text-foreground text-left mb-10">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Columns: Forms */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Address Selection */}
            <div className="bg-card rounded-3xl border border-border shadow-sm p-6 text-left space-y-6">
              <h3 className="font-extrabold text-foreground text-lg flex items-center gap-2 border-b border-border pb-3">
                <MapPin className="h-5 w-5 text-primary" /> 1. Select Delivery Address
              </h3>

              {savedAddresses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr._id}
                      type="button"
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`p-4 border rounded-2xl text-left transition-all relative ${
                        selectedAddressId === addr._id
                          ? "border-primary bg-primary/5 text-foreground shadow-sm font-semibold"
                          : "border-border bg-card text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      <div className="text-xs font-bold text-foreground mb-1">{addr.fullName} ({addr.addressType})</div>
                      <div className="text-[10px] line-clamp-2">{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</div>
                      <div className="text-[10px] mt-2 font-bold text-foreground">Phone: {addr.mobileNumber}</div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedAddressId("new")}
                    className={`p-4 border rounded-2xl text-center flex flex-col justify-center items-center transition-all ${
                      selectedAddressId === "new"
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-dashed border-border bg-card text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <Plus className="h-5 w-5 mb-1 text-primary" />
                    <span className="text-xs font-bold">Use A New Address</span>
                  </button>
                </div>
              )}

              {(savedAddresses.length === 0 || selectedAddressId === "new") && (
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName">Receiver's Name *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        required
                        value={newAddress.fullName}
                        onChange={handleInputChange}
                        placeholder="Sarah Johnson"
                        className="bg-secondary border-border focus-visible:ring-ring"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="mobileNumber">Contact Phone Number *</Label>
                      <Input
                        id="mobileNumber"
                        name="mobileNumber"
                        type="tel"
                        required
                        value={newAddress.mobileNumber}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                        className="bg-secondary border-border focus-visible:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="addressLine1">Street Address / Block *</Label>
                    <Input
                      id="addressLine1"
                      name="addressLine1"
                      required
                      value={newAddress.addressLine1}
                      onChange={handleInputChange}
                      placeholder="Flat 402, Royal Residency"
                      className="bg-secondary border-border focus-visible:ring-ring"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        required
                        value={newAddress.city}
                        onChange={handleInputChange}
                        className="bg-secondary border-border focus-visible:ring-ring"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        required
                        value={newAddress.state}
                        onChange={handleInputChange}
                        className="bg-secondary border-border focus-visible:ring-ring"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="zip">Pincode / ZIP *</Label>
                      <Input
                        id="zip"
                        name="zip"
                        required
                        value={newAddress.zip}
                        onChange={handleInputChange}
                        placeholder="400001"
                        className="bg-secondary border-border focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Gift Message Area */}
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="giftNote" className="flex items-center gap-1.5">
                  <Gift className="h-4 w-4 text-primary" /> Gift Message / Special Delivery Note
                </Label>
                <Textarea
                  id="giftNote"
                  name="giftNote"
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="Write a lovely note to print on a greeting card or delivery instructions (e.g., Leave with security)."
                  rows={3}
                  className="bg-secondary border-border focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* 2. Delivery Scheduling Info */}
            <div className="bg-card rounded-3xl border border-border shadow-sm p-6 text-left space-y-4">
              <h3 className="font-extrabold text-foreground text-lg flex items-center gap-2 border-b border-border pb-3">
                <Calendar className="h-5 w-5 text-primary" /> 2. Delivery Schedule
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="delivery-date-input">Delivery Date *</Label>
                  <Input
                    id="delivery-date-input"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="bg-secondary border-border text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Delivery Slot *</Label>
                  <select
                    value={deliveryTimeSlot}
                    onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                    className="w-full text-xs font-semibold bg-secondary border border-border rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                  >
                    <option>Morning (9 AM - 12 PM)</option>
                    <option>Afternoon (12 PM - 4 PM)</option>
                    <option>Evening (4 PM - 8 PM)</option>
                    <option>Night Delivery (8 PM - 11 PM) (+ ₹150)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-card rounded-3xl border border-border shadow-sm p-6 text-left space-y-6">
              <h3 className="font-extrabold text-foreground text-lg flex items-center gap-2 border-b border-border pb-3">
                <CreditCard className="h-5 w-5 text-primary" /> 3. Payment Option
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === "card"
                      ? "bg-primary border-primary text-primary-foreground font-bold shadow-md shadow-primary/10"
                      : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  <CreditCard className="h-5 w-5" /> Credit / Debit Card
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === "cod"
                      ? "bg-primary border-primary text-primary-foreground font-bold shadow-md shadow-primary/10"
                      : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  <Landmark className="h-5 w-5" /> Cash on Delivery (COD)
                </button>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="space-y-1.5">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      className="bg-secondary border-border focus-visible:ring-ring"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="cardExpiry">Expiration</Label>
                      <Input
                        id="cardExpiry"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cardCvv">CVV Code</Label>
                      <Input
                        id="cardCvv"
                        type="password"
                        placeholder="•••"
                        maxLength={3}
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "cod" && (
                <p className="text-[10px] text-muted-foreground bg-secondary p-3.5 rounded-xl border border-border leading-relaxed text-center">
                  📢 Please keep cash ready. A delivery partner will collect cash payment of <strong>₹{grandTotal.toFixed(2)}</strong> at delivery doorstep.
                </p>
              )}
            </div>

          </div>

          {/* Right Column: Checkout Summary */}
          <aside className="space-y-6">
            <div className="bg-card rounded-3xl border border-border shadow-sm p-6 text-left space-y-6">
              <h3 className="font-bold text-foreground text-lg border-b border-border pb-3">Checkout Summary</h3>

              {/* Items listing */}
              <div className="max-h-40 overflow-y-auto space-y-3 pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-foreground line-clamp-1">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground">{item.flavor} ({item.weight}) &times; {item.quantity}</span>
                    </div>
                    <span className="font-extrabold text-primary shrink-0">
                      ₹{(item.price * (1 - (item.discount || 0)/100) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-border" />

              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="font-semibold text-foreground">₹{subtotal.toFixed(2)}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({coupon.code})</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-foreground">
                    {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <hr className="border-border" />

              <div className="flex justify-between text-base font-black text-foreground">
                <span>Grand Total</span>
                <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
              </div>

              <Button
                onClick={handleOpenInvoice}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-primary/10 text-base"
              >
                <FileText className="h-5 w-5" /> Verify & Preview Invoice
              </Button>
            </div>
          </aside>
        </div>

      </div>

      {/* Invoice Preview Modal */}
      {isInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col scale-in max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-secondary/30 shrink-0">
              <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Professional Invoice Preview
              </h3>
              <button 
                onClick={() => setIsInvoiceOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable invoice contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left text-xs bg-background">
              
              {/* Order Numbers & Meta */}
              <div className="flex justify-between border-b border-border pb-4">
                <div>
                  <h4 className="font-black text-sm text-foreground mb-1">Happkamal Sweet Bakery</h4>
                  <p className="text-muted-foreground">Artisanal Cakes & Occasion Specialists</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">Temporary ID: {tempOrderNumber}</p>
                  <p className="text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-6 border-b border-border pb-4 text-xs">
                <div>
                  <span className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Billed To</span>
                  <p className="font-bold text-foreground mt-1">{selectedShipping.name}</p>
                  <p className="text-muted-foreground">Contact: {selectedShipping.phone}</p>
                </div>
                <div>
                  <span className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Shipping Location</span>
                  <p className="text-foreground mt-1 font-semibold">{selectedShipping.street}</p>
                  <p className="text-muted-foreground">{selectedShipping.city}, {selectedShipping.state} - {selectedShipping.zip}</p>
                  {giftNote && <p className="text-primary italic mt-1.5 font-medium">"Note: {giftNote}"</p>}
                </div>
              </div>

              {/* Delivery info */}
              <div className="grid grid-cols-2 gap-6 bg-secondary/40 p-4 rounded-xl border border-border">
                <div>
                  <span className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Scheduled Delivery</span>
                  <p className="font-bold text-foreground mt-1 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" /> {deliveryDate}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Delivery Time Slot</span>
                  <p className="font-bold text-foreground mt-1 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" /> {deliveryTimeSlot}
                  </p>
                </div>
              </div>

              {/* Table list */}
              <div className="space-y-3">
                <span className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Line Items</span>
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-secondary/40 text-[10px] text-muted-foreground border-b border-border font-bold">
                        <th className="p-3">Cake Item / Spec</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-medium text-foreground">
                      {cartItems.map((item) => {
                        const discounted = item.price * (1 - (item.discount || 0)/100);
                        return (
                          <tr key={item.id} className="text-xs">
                            <td className="p-3">
                              <div className="font-bold text-foreground">{item.name}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">{item.flavor} | {item.weight} {item.isEggless ? "(Eggless)" : ""}</div>
                              {item.cakeMessage && <div className="text-[10px] italic text-primary mt-0.5">"{item.cakeMessage}"</div>}
                            </td>
                            <td className="p-3 text-center font-bold">{item.quantity}</td>
                            <td className="p-3 text-right">₹{discounted.toFixed(2)}</td>
                            <td className="p-3 text-right font-bold text-primary">₹{(discounted * item.quantity).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end pt-4">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-bold text-foreground">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {coupon && (
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>Coupon Discount</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Charge</span>
                    <span className="font-bold text-foreground">₹{deliveryCharge.toFixed(2)}</span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between text-sm font-black text-foreground">
                    <span>Grand Total</span>
                    <span className="text-primary text-base">₹{grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground text-right mt-2">
                    Payment Method: <span className="font-bold uppercase text-foreground">{paymentMethod}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="p-5 border-t border-border bg-secondary/30 flex gap-4 shrink-0">
              <Button 
                onClick={() => setIsInvoiceOpen(false)} 
                variant="outline"
                className="w-full border-border hover:bg-secondary text-foreground rounded-xl font-bold h-12"
              >
                Cancel / Edit Form
              </Button>
              <Button 
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold rounded-xl h-12 shadow-md shadow-primary/10"
              >
                Confirm & Place Order
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Payment Gateway Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl p-6 text-center space-y-6 scale-in">
            <div className="h-12 w-12 bg-primary/15 text-primary rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
              <CreditCard className="h-6 w-6" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-foreground tracking-tight">Simulated Payment Gateway</h3>
              <p className="text-xs text-muted-foreground">
                Simulating secure online transaction through Razorpay API integration.
              </p>
            </div>

            <div className="bg-secondary rounded-2xl p-4 border border-border space-y-3 text-xs text-left">
              <div className="flex justify-between font-bold text-foreground">
                <span>Baker Receipt ID:</span>
                <span className="text-muted-foreground">{paymentOrderInfo?.order?.orderNumber}</span>
              </div>
              <div className="flex justify-between font-bold text-foreground">
                <span>Razorpay Order ID:</span>
                <span className="text-muted-foreground font-mono">{paymentOrderInfo?.paymentOrder?.id}</span>
              </div>
              <div className="flex justify-between font-black text-foreground border-t border-border/50 pt-2 text-sm">
                <span>Amount Payable:</span>
                <span className="text-primary">₹{paymentOrderInfo?.order?.grandTotal?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <Button 
                onClick={() => handleSimulatePayment(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl h-12 shadow-md"
              >
                Simulate Successful Payment
              </Button>
              <Button 
                onClick={() => handleSimulatePayment(false)}
                variant="outline"
                className="w-full border-rose-200 hover:bg-rose-50 text-rose-600 font-bold rounded-xl h-12"
              >
                Simulate Failed Payment
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
