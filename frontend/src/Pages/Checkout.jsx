import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
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
  X,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import paymentService from "@/services/paymentService";

export default function Checkout() {
  const { cartItems, getCart, subtotal, discountAmount, deliveryCharge, taxAmount, grandTotal, clearCart, coupon } = useCart();
  const { settings } = useSelector((state) => state.siteSettings);
  const freeShippingThreshold = settings?.shipping?.freeShippingThreshold ?? 800;
  const navigate = useNavigate();

  // Wizard Steps: "address" -> "delivery" -> "payment" -> "review" -> "success" | "failed"
  const [step, setStep] = useState("address");
  const [orderId, setOrderId] = useState("");
  
  // Addresses States
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    mobileNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    country: "India",
    addressType: "Home",
  });
  
  // Scheduling & Delivery details
  const [giftNote, setGiftNote] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("Afternoon (12 PM - 4 PM)");

  // Payment states: "razorpay" | "cod"
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  // Loading States
  const [loading, setLoading] = useState(false);

  // Load cart and saved addresses on mount
  useEffect(() => {
    getCart();
    loadAddresses();
  }, []);

  const loadAddresses = () => {
    axios.get(`${API_BASE_URL}/users/addresses`, { withCredentials: true })
      .then((res) => {
        const addresses = res.data?.data || [];
        setSavedAddresses(addresses);
        const def = addresses.find(a => a.isDefault);
        if (def) setSelectedAddressId(def._id);
        else if (addresses.length > 0) setSelectedAddressId(addresses[0]._id);
      })
      .catch((err) => console.error("Error loading addresses:", err));
  };

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
    setAddressForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
      name: addressForm.fullName,
      phone: addressForm.mobileNumber,
      street: addressForm.addressLine2 ? `${addressForm.addressLine1}, ${addressForm.addressLine2}` : addressForm.addressLine1,
      city: addressForm.city,
      state: addressForm.state,
      zip: addressForm.pincode,
      giftNote,
    };
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!addressForm.fullName || !addressForm.mobileNumber || !addressForm.addressLine1 || !addressForm.pincode) {
      toast.error("Please fill all required address fields");
      return;
    }

    try {
      if (isEditingAddress && editingAddressId) {
        const res = await axios.patch(
          `${API_BASE_URL}/users/addresses/${editingAddressId}`,
          addressForm,
          { withCredentials: true }
        );
        toast.success("Address updated successfully!");
        setSavedAddresses((prev) => prev.map((a) => (a._id === editingAddressId ? res.data.data : a)));
      } else {
        const res = await axios.post(
          `${API_BASE_URL}/users/addresses`,
          addressForm,
          { withCredentials: true }
        );
        toast.success("Address added successfully!");
        setSavedAddresses((prev) => [...prev, res.data.data]);
        setSelectedAddressId(res.data.data._id);
      }
      setIsEditingAddress(false);
      setEditingAddressId(null);
      resetAddressForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save address");
    }
  };

  const handleEditClick = (addr, e) => {
    e.stopPropagation();
    setIsEditingAddress(true);
    setEditingAddressId(addr._id);
    setSelectedAddressId("new");
    setAddressForm({
      fullName: addr.fullName,
      mobileNumber: addr.mobileNumber,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country || "India",
      addressType: addr.addressType || "Home",
    });
  };

  const handleDeleteClick = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/users/addresses/${id}`, { withCredentials: true });
      toast.success("Address deleted successfully!");
      setSavedAddresses((prev) => prev.filter((a) => a._id !== id));
      if (selectedAddressId === id) {
        setSelectedAddressId("");
      }
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefaultClick = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.patch(`${API_BASE_URL}/users/addresses/${id}/default`, {}, { withCredentials: true });
      toast.success("Default address updated!");
      loadAddresses();
    } catch (err) {
      toast.error("Failed to update default address");
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      fullName: "",
      mobileNumber: "",
      addressLine1: "",
      addressLine2: "",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India",
      addressType: "Home",
    });
  };

  const handleProceedToReview = () => {
    setStep("review");
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    const shipping = getShippingPayload();

    try {
      // 1. Create Pending Order on Backend
      const response = await axios.post(
        `${API_BASE_URL}/orders`,
        {
          shippingAddress: shipping,
          paymentMethod,
        },
        { withCredentials: true }
      );

      const createdOrder = response.data?.data;

      // COD Path (Order is confirmed immediately)
      if (paymentMethod === "cod") {
        setOrderId(createdOrder.order.orderNumber);
        await clearCart();
        setStep("success");
        toast.success("Order Placed Successfully!");
      } 
      // Online Razorpay Payment Path
      else if (paymentMethod === "razorpay" || paymentMethod === "card") {
        // 2. Create Razorpay Payment Order on Backend
        const paymentOrderData = await paymentService.createPaymentOrder(
          createdOrder.order._id
        );

        // 3. Open Razorpay Checkout Modal
        await paymentService.openRazorpay({
          orderId: paymentOrderData.orderId,
          amount: paymentOrderData.amount,
          currency: paymentOrderData.currency,
          orderNumber: paymentOrderData.orderNumber,
          userDetails: {
            name: shipping.name,
            phone: shipping.phone,
          },
          onSuccess: async () => {
            setOrderId(paymentOrderData.orderNumber);
            await clearCart();
            setStep("success");
            toast.success("Payment verified! Order placed successfully.");
            setLoading(false);
          },
          onFailure: (err) => {
            setStep("failed");
            toast.error(err?.message || "Payment verification failed.");
            setLoading(false);
          },
          onDismiss: () => {
            setLoading(false);
            toast.warning("Payment sheet closed. Complete payment to place order.");
          },
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to process order.");
      setLoading(false);
    }
  };

  const selectedShipping = getShippingPayload() || {};

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm font-bold text-pink-600 hover:text-pink-700 mb-8">
          <ChevronLeft className="h-4 w-4" /> Back to Cart
        </Link>

        {/* Wizard Progress Bar */}
        {["address", "delivery", "payment", "review"].includes(step) && (
          <div className="max-w-3xl mx-auto mb-12">
            <div className="flex items-center justify-between relative">
              {/* Connecting line */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-border z-0" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-pink-600 z-0 transition-all duration-500"
                style={{
                  width: step === "address" ? "0%" : step === "delivery" ? "33%" : step === "payment" ? "66%" : "100%"
                }}
              />
              
              {/* Steps indicators */}
              {[
                { key: "address", label: "Address" },
                { key: "delivery", label: "Delivery" },
                { key: "payment", label: "Payment" },
                { key: "review", label: "Review" },
              ].map((s, idx) => {
                const stepOrder = ["address", "delivery", "payment", "review"];
                const isCompleted = stepOrder.indexOf(step) > idx;
                const isActive = step === s.key;
                return (
                  <div key={s.key} className="flex flex-col items-center z-10">
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isCompleted ? "bg-pink-600 border-pink-600 text-white" : isActive ? "bg-background border-pink-600 text-pink-600 font-extrabold ring-4 ring-pink-100 dark:ring-pink-950/30" : "bg-background border-border text-muted-foreground"
                    }`}>
                      {isCompleted ? "✓" : idx + 1}
                    </span>
                    <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${isActive ? "text-pink-600 font-black" : "text-muted-foreground"}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Outer step states layout */}
        <AnimatePresence mode="wait">
          {step === "success" && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-lg mx-auto bg-card rounded-3xl border border-border shadow-xl p-8 sm:p-12 text-center space-y-6"
            >
              <div className="h-16 w-16 bg-green-100 dark:bg-green-950/20 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-foreground">Order Confirmed!</h2>
                <p className="text-sm text-muted-foreground">Your baking slot has been reserved successfully.</p>
              </div>
              <div className="bg-secondary rounded-2xl p-4 border border-border text-xs text-left space-y-2">
                <div className="flex justify-between font-bold text-foreground">
                  <span>Order Reference ID:</span>
                  <span className="text-pink-600 font-black">#{orderId}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal">
                  We have generated a summary invoice receipt and sent confirmation updates. You can track progress below.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button asChild className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold py-6">
                  <Link to={`/track-order?id=${orderId}`}>Track Order Timeline</Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-border hover:bg-secondary rounded-xl font-bold py-6">
                  <Link to="/shop">Back to Shop</Link>
                </Button>
              </div>
            </motion.div>
          )}

          {step === "failed" && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-lg mx-auto bg-card rounded-3xl border border-border shadow-xl p-8 sm:p-12 text-center space-y-6"
            >
              <div className="h-16 w-16 bg-rose-100 dark:bg-rose-950/20 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="h-10 w-10 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-foreground">Payment Failed</h2>
                <p className="text-sm text-muted-foreground">We were unable to verify your online transaction.</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Your items remain safely inside your cart. Feel free to attempt the payment transaction again or choose Cash on Delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={() => setStep("review")} className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold py-6">
                  Retry Payment
                </Button>
                <Button asChild variant="outline" className="w-full border-border hover:bg-secondary rounded-xl font-bold py-6">
                  <Link to="/cart">Modify Cart</Link>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Form Wizard Layout */}
          {["address", "delivery", "payment", "review"].includes(step) && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              
              {/* Left Form Content */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Step 1: Address Selection */}
                {step === "address" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-card rounded-3xl border border-border shadow-sm p-6 text-left space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <h3 className="font-extrabold text-foreground text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-pink-600" /> 1. Select Delivery Address
                      </h3>
                    </div>

                    {/* Saved Addresses list */}
                    {savedAddresses.length > 0 && !isEditingAddress && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {savedAddresses.map((addr) => (
                          <div
                            key={addr._id}
                            onClick={() => setSelectedAddressId(addr._id)}
                            className={`p-5 border rounded-2xl text-left cursor-pointer transition-all relative group flex flex-col justify-between h-40 ${
                              selectedAddressId === addr._id
                                ? "border-pink-600 bg-pink-50/15 text-foreground shadow-sm font-semibold"
                                : "border-border bg-card text-muted-foreground hover:bg-secondary/40"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1.5 mb-2">
                                <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-extrabold text-[9px] uppercase px-2 py-0.5 rounded">
                                  {addr.addressType}
                                </span>
                                {addr.isDefault && (
                                  <span className="text-[9px] text-green-600 font-extrabold bg-green-50 px-2 py-0.5 rounded border border-green-150">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="text-xs font-black text-foreground mb-1">{addr.fullName}</div>
                              <div className="text-[10px] leading-relaxed line-clamp-2">{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</div>
                              <div className="text-[10px] mt-1 text-foreground font-semibold">Phone: {addr.mobileNumber}</div>
                            </div>
                            
                            {/* Address Action Bar */}
                            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/60">
                              <button 
                                onClick={(e) => handleEditClick(addr, e)} 
                                className="text-[10px] font-bold text-muted-foreground hover:text-pink-600 flex items-center gap-1"
                              >
                                <Edit2 className="h-3 w-3" /> Edit
                              </button>
                              <button 
                                onClick={(e) => handleDeleteClick(addr._id, e)} 
                                className="text-[10px] font-bold text-muted-foreground hover:text-red-600 flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" /> Delete
                              </button>
                              {!addr.isDefault && (
                                <button 
                                  onClick={(e) => handleSetDefaultClick(addr._id, e)} 
                                  className="text-[10px] font-bold text-pink-600 hover:underline ml-auto"
                                >
                                  Make Default
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAddressId("new");
                            setIsEditingAddress(true);
                            resetAddressForm();
                          }}
                          className="p-5 border-2 border-dashed border-border hover:border-pink-300 hover:bg-secondary/20 rounded-2xl flex flex-col justify-center items-center gap-2 transition text-muted-foreground h-40"
                        >
                          <Plus className="h-6 w-6 text-pink-600" />
                          <span className="text-xs font-bold text-foreground">Add New Address</span>
                        </button>
                      </div>
                    )}

                    {/* New/Edit Address Form */}
                    {(savedAddresses.length === 0 || isEditingAddress) && (
                      <form onSubmit={handleAddressSubmit} className="space-y-4 pt-2">
                        <div className="flex items-center justify-between border-b border-border/50 pb-2">
                          <h4 className="font-bold text-sm text-foreground">
                            {editingAddressId ? "Modify Address" : "Add Address Specifications"}
                          </h4>
                          {savedAddresses.length > 0 && (
                            <button 
                              type="button" 
                              onClick={() => {
                                setIsEditingAddress(false);
                                setEditingAddressId(null);
                                resetAddressForm();
                                if (savedAddresses.length > 0) setSelectedAddressId(savedAddresses[0]._id);
                              }}
                              className="text-xs text-muted-foreground hover:text-foreground font-bold flex items-center gap-1"
                            >
                              <X className="h-4 w-4" /> Cancel
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="fullName">Receiver Full Name *</Label>
                            <Input
                              id="fullName"
                              name="fullName"
                              required
                              value={addressForm.fullName}
                              onChange={handleInputChange}
                              placeholder="E.g., Sarah Johnson"
                              className="bg-secondary border-border"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="mobileNumber">Contact Phone Number *</Label>
                            <Input
                              id="mobileNumber"
                              name="mobileNumber"
                              type="tel"
                              required
                              value={addressForm.mobileNumber}
                              onChange={handleInputChange}
                              placeholder="10-digit number"
                              className="bg-secondary border-border"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="addressLine1">Flat / House No. / Building *</Label>
                            <Input
                              id="addressLine1"
                              name="addressLine1"
                              required
                              value={addressForm.addressLine1}
                              onChange={handleInputChange}
                              placeholder="E.g., Flat 402, Block C"
                              className="bg-secondary border-border"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="addressLine2">Street Address / Locality</Label>
                            <Input
                              id="addressLine2"
                              name="addressLine2"
                              value={addressForm.addressLine2}
                              onChange={handleInputChange}
                              placeholder="E.g., Royal Residency Road"
                              className="bg-secondary border-border"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="city">City *</Label>
                            <Input
                              id="city"
                              name="city"
                              required
                              value={addressForm.city}
                              onChange={handleInputChange}
                              className="bg-secondary border-border"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="state">State *</Label>
                            <Input
                              id="state"
                              name="state"
                              required
                              value={addressForm.state}
                              onChange={handleInputChange}
                              className="bg-secondary border-border"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="pincode">Pincode *</Label>
                            <Input
                              id="pincode"
                              name="pincode"
                              required
                              value={addressForm.pincode}
                              onChange={handleInputChange}
                              placeholder="400001"
                              className="bg-secondary border-border"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="addressType">Address Tag</Label>
                            <select
                              id="addressType"
                              name="addressType"
                              value={addressForm.addressType}
                              onChange={handleInputChange}
                              className="w-full text-xs font-semibold bg-secondary border border-border rounded-xl p-2.5 text-foreground focus:outline-none"
                            >
                              <option value="Home">Home (All-Day Delivery)</option>
                              <option value="Office">Office (9 AM - 6 PM)</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-5 rounded-xl text-xs shadow-sm">
                          Save & Select Address
                        </Button>
                      </form>
                    )}

                    {/* Nav Actions */}
                    {savedAddresses.length > 0 && !isEditingAddress && (
                      <div className="flex justify-end pt-4 border-t border-border">
                        <Button 
                          onClick={() => {
                            if (!selectedAddressId) {
                              toast.error("Please select a delivery address to proceed.");
                              return;
                            }
                            setStep("delivery");
                          }}
                          className="bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl px-6 py-5 text-xs flex items-center gap-1"
                        >
                          Next Step <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Delivery Scheduling */}
                {step === "delivery" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-card rounded-3xl border border-border shadow-sm p-6 text-left space-y-6"
                  >
                    <h3 className="font-extrabold text-foreground text-lg flex items-center gap-2 border-b border-border pb-3">
                      <Calendar className="h-5 w-5 text-pink-600" /> 2. Delivery Scheduling & Gift Options
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <Label htmlFor="deliveryDate">Choose Delivery Date *</Label>
                        <Input
                          id="deliveryDate"
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          className="bg-secondary border-border focus-visible:ring-ring text-xs p-3.5 h-11"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="deliverySlot">Choose Delivery Time Slot *</Label>
                        <select
                          id="deliverySlot"
                          value={deliveryTimeSlot}
                          onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                          className="w-full text-xs font-semibold bg-secondary border border-border rounded-xl p-3 h-11 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option>Morning (9 AM - 12 PM)</option>
                          <option>Afternoon (12 PM - 4 PM)</option>
                          <option>Evening (4 PM - 8 PM)</option>
                          <option>Night Delivery (8 PM - 11 PM) (+ ₹150)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="giftNote" className="flex items-center gap-1.5 font-bold">
                        <Gift className="h-4 w-4 text-pink-600" /> Write Gift Message (Optional)
                      </Label>
                      <Textarea
                        id="giftNote"
                        value={giftNote}
                        onChange={(e) => setGiftNote(e.target.value)}
                        placeholder="Add a sweet message for a greeting card, or special delivery instructions (e.g. Please do not ring the bell, leave at the door)."
                        rows={4}
                        className="bg-secondary border-border text-xs rounded-xl"
                      />
                    </div>

                    <div className="flex justify-between pt-4 border-t border-border">
                      <Button 
                        onClick={() => setStep("address")}
                        variant="outline"
                        className="border-border hover:bg-secondary rounded-xl font-bold px-6 py-5 text-xs"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={() => {
                          if (!deliveryDate) {
                            toast.error("Please pick a valid delivery date.");
                            return;
                          }
                          setStep("payment");
                        }}
                        className="bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl px-6 py-5 text-xs flex items-center gap-1"
                      >
                        Next Step <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment Method Selection */}
                {step === "payment" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-card rounded-3xl border border-border shadow-sm p-6 text-left space-y-6"
                  >
                    <div className="border-b border-border pb-3">
                      <h3 className="font-extrabold text-foreground text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-pink-600" /> 3. Select Payment Method
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Choose your preferred payment method. We support fast Indian UPI apps, cards, and netbanking via Razorpay, and Cash on Delivery.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 1. Razorpay Option (Primary Indian UPI / Cards) */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("razorpay")}
                        className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-48 transition-all relative ${
                          paymentMethod === "razorpay" || paymentMethod === "card"
                            ? "border-pink-600 bg-pink-50/15 shadow-md shadow-pink-600/5 ring-2 ring-pink-500/20"
                            : "border-border bg-card hover:bg-secondary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="h-10 w-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center">
                            <Sparkles className="h-5 w-5" />
                          </div>
                          <span className="text-[9px] font-black uppercase bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-md">
                            Fast UPI / Cards
                          </span>
                        </div>
                        <div>
                          <div className="text-xs font-black text-foreground mb-1">Razorpay (Online Payment)</div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Google Pay, PhonePe, Paytm, QR code, NetBanking, and credit/debit cards.
                          </p>
                        </div>
                      </button>

                      {/* 2. Cash On Delivery Option */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cod")}
                        className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-48 transition-all ${
                          paymentMethod === "cod"
                            ? "border-pink-600 bg-pink-50/15 shadow-md shadow-pink-600/5 ring-2 ring-pink-500/20"
                            : "border-border bg-card hover:bg-secondary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                            <Landmark className="h-5 w-5" />
                          </div>
                          <span className="text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                            Pay on Delivery
                          </span>
                        </div>
                        <div>
                          <div className="text-xs font-black text-foreground mb-1">Cash on Delivery (COD)</div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Confirm order now and settle payment in cash upon doorstep delivery.
                          </p>
                        </div>
                      </button>
                    </div>

                    {/* Razorpay Test Mode Helper */}
                    {(paymentMethod === "razorpay" || paymentMethod === "card") && (import.meta.env.VITE_RAZORPAY_KEY_ID || "").startsWith("rzp_test_") && (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-200 text-xs space-y-2">
                        <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-100">
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Razorpay Test Mode Active
                        </div>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                          Do <strong>NOT</strong> enter your real personal card! In the Razorpay popup, use official test credentials:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                          <div className="p-2.5 bg-background/90 rounded-xl border border-amber-200 dark:border-amber-900/40">
                            <span className="text-muted-foreground block text-[10px] font-sans font-semibold">Test UPI Simulation</span>
                            <span className="font-bold select-all text-pink-600">success@razorpay</span>
                            <span className="text-muted-foreground block text-[10px] font-sans">Simulates instant approval</span>
                          </div>
                          <div className="p-2.5 bg-background/90 rounded-xl border border-amber-200 dark:border-amber-900/40">
                            <span className="text-muted-foreground block text-[10px] font-sans font-semibold">Test Card (Success)</span>
                            <span className="font-bold select-all text-pink-600">4111 1111 1111 1111</span>
                            <span className="text-muted-foreground block text-[10px] font-sans">Expiry: Future date | CVV: 123</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-4 border-t border-border">
                      <Button 
                        onClick={() => setStep("delivery")}
                        variant="outline"
                        className="border-border hover:bg-secondary rounded-xl font-bold px-6 py-5 text-xs"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handleProceedToReview}
                        className="bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl px-6 py-5 text-xs flex items-center gap-1 shadow-md shadow-pink-600/10"
                      >
                        Review Order <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Final Order Review & Payment Execution */}
                {step === "review" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-card rounded-3xl border border-border shadow-sm p-6 text-left space-y-6"
                  >
                    <h3 className="font-extrabold text-foreground text-lg flex items-center gap-2 border-b border-border pb-3">
                      <FileText className="h-5 w-5 text-pink-600" /> 4. Order Preview & Invoice Summary
                    </h3>

                    {/* Invoice Meta */}
                    <div className="flex justify-between border-b border-border/50 pb-4 text-xs">
                      <div>
                        <h4 className="font-black text-sm text-foreground mb-0.5">Happkamal Sweet Bakery</h4>
                        <p className="text-muted-foreground">Artisanal Cakes & Occasions Specialists</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">Date: {new Date().toLocaleDateString("en-IN")}</p>
                        <p className="text-pink-600 uppercase text-[10px] font-black">
                          Payment Gateway: {paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay (Online Payment / UPI / Cards)"}
                        </p>
                      </div>
                    </div>

                    {/* Shipping Address Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-border/50 pb-4 text-xs leading-relaxed">
                      <div>
                        <span className="text-muted-foreground font-black text-[9px] uppercase tracking-wider block mb-1">Delivery Destination</span>
                        <p className="font-bold text-foreground">{selectedShipping?.name || ""}</p>
                        <p className="text-muted-foreground">{selectedShipping?.street || ""}</p>
                        <p className="text-muted-foreground">{selectedShipping?.city || ""}, {selectedShipping?.state || ""} - {selectedShipping?.zip || ""}</p>
                        <p className="text-foreground font-semibold mt-1">📞 {selectedShipping?.phone || ""}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-black text-[9px] uppercase tracking-wider block mb-1">Scheduled Timing</span>
                        <p className="font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                          <Calendar className="h-4 w-4 text-pink-600" /> {deliveryDate}
                        </p>
                        <p className="font-bold text-foreground flex items-center gap-1.5 mt-1">
                          <Clock className="h-4 w-4 text-pink-600" /> {deliveryTimeSlot}
                        </p>
                        {giftNote && (
                          <div className="mt-3 p-2 bg-secondary/40 rounded-lg border border-border text-[10px] text-pink-600 italic">
                            "Gift Note: {giftNote}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="space-y-3">
                      <span className="text-muted-foreground font-black text-[9px] uppercase tracking-wider block">Line Items</span>
                      <div className="border border-border rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-secondary/40 text-[10px] text-muted-foreground border-b border-border font-bold">
                              <th className="p-3">Cake Spec</th>
                              <th className="p-3 text-center">Qty</th>
                              <th className="p-3 text-right">Unit Price</th>
                              <th className="p-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border font-medium text-foreground">
                            {cartItems.map((item) => {
                              const discounted = item.price * (1 - (item.discount || 0) / 100);
                              return (
                                <tr key={item.id}>
                                  <td className="p-3">
                                    <div className="font-bold text-foreground">{item.name}</div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">{item.flavor} | {item.weight} {item.isEggless ? "(Eggless)" : ""}</div>
                                    {item.cakeMessage && <div className="text-[10px] italic text-pink-600 mt-0.5">"{item.cakeMessage}"</div>}
                                  </td>
                                  <td className="p-3 text-center font-bold">{item.quantity}</td>
                                  <td className="p-3 text-right">₹{discounted.toFixed(2)}</td>
                                  <td className="p-3 text-right font-black text-pink-600">₹{(discounted * item.quantity).toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Final Actions for COD / Razorpay */}
                    <div className="flex justify-between pt-6 border-t border-border">
                      <Button 
                        onClick={() => setStep("payment")}
                        variant="outline"
                        className="border-border hover:bg-secondary rounded-xl font-bold px-6 py-5 text-xs"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl px-10 py-6 text-sm shadow-md shadow-pink-600/10"
                      >
                        {loading
                          ? "Processing Order..."
                          : paymentMethod === "cod"
                          ? "Confirm & Place COD Order"
                          : `Pay ₹${grandTotal.toFixed(2)} with Razorpay`}
                      </Button>
                    </div>
                  </motion.div>
                )}

              </div>

              {/* Right Summary column */}
              <aside className="lg:sticky lg:top-8 space-y-6">
                <div className="bg-card rounded-3xl border border-border shadow-sm p-6 text-left space-y-6">
                  <h3 className="font-extrabold text-foreground text-base border-b border-border pb-3">Checkout Summary</h3>

                  {/* Tiny Item Listing */}
                  <div className="max-h-40 overflow-y-auto space-y-3 pr-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-foreground line-clamp-1">{item.name}</span>
                          <span className="text-[10px] text-muted-foreground">{item.flavor} ({item.weight}) &times; {item.quantity}</span>
                        </div>
                        <span className="font-black text-pink-600 shrink-0">
                          ₹{(item.price * (1 - (item.discount || 0)/100) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <hr className="border-border" />

                  {/* Cost list details */}
                  <div className="space-y-3.5 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-foreground">₹{subtotal.toFixed(2)}</span>
                    </div>
                    {coupon && (
                      <div className="flex justify-between text-green-600 font-bold">
                        <span>Coupon Discount ({coupon.code})</span>
                        <span>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery Charge</span>
                      <span className="font-semibold text-foreground">
                        {deliveryCharge === 0 ? <strong className="text-green-600 uppercase font-black">Free</strong> : `₹${deliveryCharge.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Tax (5%)</span>
                      <span className="font-semibold text-foreground">₹{taxAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <hr className="border-border" />

                  <div className="flex justify-between text-base font-black text-foreground">
                    <span>Grand Total</span>
                    <span className="text-pink-600 text-lg font-black">₹{grandTotal.toFixed(2)}</span>
                  </div>

                  {subtotal < freeShippingThreshold && (
                    <p className="text-[10px] text-muted-foreground bg-secondary p-3 rounded-xl border border-border text-center leading-relaxed">
                      💡 Add only <strong className="text-pink-600">₹{(freeShippingThreshold - subtotal).toFixed(2)}</strong> more to unlock <strong>FREE DELIVERY</strong>!
                    </p>
                  )}
                </div>
              </aside>

            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
