import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  User,
  ShoppingBag,
  MapPin,
  Bell,
  LogOut,
  Camera,
  Mail,
  Phone,
  Sparkles,
  Lock,
  Trash2,
  Clock
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePanel() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Active Tab: "profile" | "orders" | "addresses" | "settings"
  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    birthdate: "",
    bio: ""
  });

  // Settings / Password State
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newFlavors: false
  });

  // Saved Addresses State
  const [addressList, setAddressList] = useState([]);
  const [newAddr, setNewAddr] = useState({ label: "Home", street: "", city: "", state: "", zip: "" });

  // Order List State
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        birthdate: user.birthdate || "",
        bio: user.bio || ""
      });

      // Load saved addresses or initialize with user's default address
      const savedAddresses = JSON.parse(localStorage.getItem("cake_user_addresses") || "[]");
      if (savedAddresses.length === 0 && user.address) {
        const defaultAddr = {
          id: "addr-default",
          label: "Default Delivery",
          street: user.address,
          city: "New York",
          state: "NY",
          zip: "10001"
        };
        setAddressList([defaultAddr]);
        localStorage.setItem("cake_user_addresses", JSON.stringify([defaultAddr]));
      } else {
        setAddressList(savedAddresses);
      }
    }
  }, [user]);

  // Load orders on activeTab = "orders"
  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("cake_user_orders") || "[]");
    setOrders(savedOrders);
  }, [activeTab]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#FFF8F9] py-12 text-center">
        <h2 className="text-xl font-bold text-gray-800">You must be logged in to view your profile</h2>
        <Button asChild className="mt-4 bg-pink-500 hover:bg-pink-600 rounded-xl font-bold">
          <Link to="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile(profileForm);
    toast.success("Profile saved successfully!");
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    toast.success("Password updated successfully!");
    setPasswords({ current: "", newPass: "", confirm: "" });
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.zip) {
      toast.error("Please fill in the street address.");
      return;
    }
    const newRecord = {
      id: `addr-${Date.now()}`,
      ...newAddr
    };
    const updated = [...addressList, newRecord];
    setAddressList(updated);
    localStorage.setItem("cake_user_addresses", JSON.stringify(updated));
    setNewAddr({ label: "Home", street: "", city: "", state: "", zip: "" });
    toast.success("New address added!");
  };

  const handleDeleteAddress = (id) => {
    const updated = addressList.filter((a) => a.id !== id);
    setAddressList(updated);
    localStorage.setItem("cake_user_addresses", JSON.stringify(updated));
    toast.info("Address deleted.");
  };

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully.");
    navigate("/");
  };

  return (
    <div className="bg-[#FFF8F9] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-left space-y-2 mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Account</h1>
          <p className="text-sm text-gray-500">Manage your profile, active orders, and addresses.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Column: Profile navigation panel */}
          <aside className="bg-white rounded-3xl border border-pink-50 shadow-sm p-6 space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-pink-50">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white text-2xl font-bold flex items-center justify-center shadow-lg">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div>
                <h3 className="font-extrabold text-gray-800 text-base">{user.firstName} {user.lastName}</h3>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100/80 border border-pink-200">
                  Loyal Guest
                </Badge>
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100/80 border border-purple-200">
                  {user.loyaltyPoints} Points
                </Badge>
              </div>
            </div>

            {/* Sidebar Buttons */}
            <div className="flex flex-col gap-1 text-left">
              {[
                { key: "profile", label: "Personal Information", icon: User },
                { key: "orders", label: "My Orders", icon: ShoppingBag },
                { key: "addresses", label: "Saved Addresses", icon: MapPin },
                { key: "settings", label: "Account Settings", icon: Bell }
              ].map((btn) => {
                const Icon = btn.icon;
                const isActive = activeTab === btn.key;
                return (
                  <button
                    key={btn.key}
                    onClick={() => setActiveTab(btn.key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                      isActive
                        ? "bg-pink-500 text-white shadow-md shadow-pink-100"
                        : "text-gray-600 hover:bg-pink-50 hover:text-pink-650"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    <span>{btn.label}</span>
                  </button>
                );
              })}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all text-left mt-4"
              >
                <LogOut className="h-4.5 w-4.5 text-red-400" />
                <span>Logout</span>
              </button>
            </div>
          </aside>

          {/* Right Column: Tab Panels */}
          <main className="lg:col-span-3">
            
            {/* TAB: Personal Profile details */}
            {activeTab === "profile" && (
              <Card className="border border-pink-50 shadow-sm rounded-3xl text-left bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-extrabold text-gray-900 flex items-center gap-1.5">
                    <User className="h-5 w-5 text-pink-500" /> Personal Details
                  </CardTitle>
                  <CardDescription>Update your personal customer details here.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                          className="bg-pink-50/10 border-pink-100 focus-visible:ring-pink-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                          className="bg-pink-50/10 border-pink-100 focus-visible:ring-pink-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="bg-pink-50/10 border-pink-100 focus-visible:ring-pink-500 pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="birthdate">Date of Birth</Label>
                        <Input
                          id="birthdate"
                          type="date"
                          value={profileForm.birthdate}
                          onChange={(e) => setProfileForm({ ...profileForm, birthdate: e.target.value })}
                          className="bg-pink-50/10 border-pink-100 focus-visible:ring-pink-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="bio">About Me (Bio)</Label>
                      <textarea
                        id="bio"
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        rows={3}
                        placeholder="Tell us what kind of cakes you enjoy!"
                        className="flex w-full rounded-2xl border border-pink-100 bg-pink-50/10 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 resize-none text-gray-700"
                      />
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                      <Button type="submit" className="bg-pink-500 hover:bg-pink-600 rounded-xl font-bold">
                        Save Profile Details
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* TAB: Order History */}
            {activeTab === "orders" && (
              <Card className="border border-pink-50 shadow-sm rounded-3xl text-left bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-extrabold text-gray-900 flex items-center gap-1.5">
                    <ShoppingBag className="h-5 w-5 text-pink-500" /> Order History
                  </CardTitle>
                  <CardDescription>View your past cake purchases and delivery tracks.</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <p className="text-gray-400 text-sm">You haven't placed any orders yet!</p>
                      <Button asChild className="bg-pink-500 hover:bg-pink-600 rounded-xl font-bold">
                        <Link to="/shop">Shop Now</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-4 rounded-2xl border border-pink-50/70 hover:border-pink-100 bg-pink-50/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-pink-600 text-sm">{ord.id}</span>
                              <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 capitalize text-[10px]">
                                {ord.status}
                              </Badge>
                            </div>
                            <h4 className="font-bold text-xs text-gray-800">
                              {ord.items?.map((it) => `${it.name} (x${it.qty})`).join(", ")}
                            </h4>
                            <div className="flex gap-4 text-[10px] text-gray-400 font-semibold pt-1">
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {ord.date}</span>
                              <span>Total: <strong className="text-gray-700 font-bold">{ord.price}</strong></span>
                            </div>
                          </div>

                          <Button asChild size="sm" className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold shrink-0">
                            <Link to={`/track-order?id=${ord.id.replace("#", "")}`}>
                              Track Order Status
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* TAB: Address management */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                
                {/* List */}
                <Card className="border border-pink-50 shadow-sm rounded-3xl text-left bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-extrabold text-gray-900 flex items-center gap-1.5">
                      <MapPin className="h-5 w-5 text-pink-500" /> Saved Delivery Locations
                    </CardTitle>
                    <CardDescription>Select or clear your default delivery address targets.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {addressList.length === 0 ? (
                      <p className="text-gray-400 text-xs text-center py-6">No saved addresses yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {addressList.map((addr) => (
                          <div
                            key={addr.id}
                            className="p-4 bg-[#FFF8F9] border border-pink-100 rounded-2xl relative flex flex-col justify-between"
                          >
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <div className="space-y-1.5 text-xs text-gray-600 text-left pr-6">
                              <span className="font-bold text-pink-600 uppercase tracking-widest text-[10px]">
                                {addr.label}
                              </span>
                              <p className="font-bold text-gray-800 leading-normal">{addr.street}</p>
                              <p className="text-[10px] text-gray-450">{addr.city}, {addr.state} {addr.zip}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Add Form */}
                <Card className="border border-pink-50 shadow-sm rounded-3xl text-left bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900">Add New Address Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddAddress} className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5 col-span-2">
                          <Label htmlFor="street">Street Address</Label>
                          <Input
                            id="street"
                            value={newAddr.street}
                            onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                            placeholder="Apt 4B, 123 Maple Street"
                            className="bg-pink-50/10 border-pink-100 text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="label">Location Name</Label>
                          <Input
                            id="label"
                            value={newAddr.label}
                            onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                            placeholder="Home / Work / Friend"
                            className="bg-pink-50/10 border-pink-100 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={newAddr.city}
                            onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                            placeholder="New York"
                            className="bg-pink-50/10 border-pink-100 text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={newAddr.state}
                            onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                            placeholder="NY"
                            className="bg-pink-50/10 border-pink-100 text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="zip">ZIP Code</Label>
                          <Input
                            id="zip"
                            value={newAddr.zip}
                            onChange={(e) => setNewAddr({ ...newAddr, zip: e.target.value })}
                            placeholder="10001"
                            className="bg-pink-50/10 border-pink-100 text-xs"
                          />
                        </div>
                      </div>

                      <Button type="submit" size="sm" className="bg-pink-500 hover:bg-pink-600 rounded-xl font-bold">
                        Save Address Location
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB: Settings & Notifications */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Change Password */}
                <Card className="border border-pink-50 shadow-sm rounded-3xl text-left bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-extrabold text-gray-900 flex items-center gap-1.5">
                      <Lock className="h-5 w-5 text-pink-500" /> Change Password
                    </CardTitle>
                    <CardDescription>Update your secret password credentials.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="current">Current Password</Label>
                        <Input
                          id="current"
                          type="password"
                          placeholder="••••••••"
                          value={passwords.current}
                          onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                          className="bg-pink-50/10 border-pink-100 focus-visible:ring-pink-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="newPass">New Password</Label>
                        <Input
                          id="newPass"
                          type="password"
                          placeholder="Minimum 8 characters"
                          value={passwords.newPass}
                          onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                          className="bg-pink-50/10 border-pink-100 focus-visible:ring-pink-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="confirm">Confirm Password</Label>
                        <Input
                          id="confirm"
                          type="password"
                          placeholder="••••••••"
                          value={passwords.confirm}
                          onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                          className="bg-pink-50/10 border-pink-100 focus-visible:ring-pink-500"
                        />
                      </div>
                      <Button type="submit" className="bg-pink-500 hover:bg-pink-600 rounded-xl font-bold">
                        Update Password
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Notifications settings */}
                <Card className="border border-pink-50 shadow-sm rounded-3xl text-left bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-extrabold text-gray-900 flex items-center gap-1.5">
                      <Bell className="h-5 w-5 text-pink-500" /> Notifications Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: "orderUpdates", label: "Baking & Shipping Notifications", desc: "Receive text/email timeline updates on your active cakes." },
                      { key: "promotions", label: "VIP Promotional Offers", desc: "Receive alerts for seasonal discount coupons." },
                      { key: "newFlavors", label: "New Arrival Flavors", desc: "Be the first to hear about seasonal fresh fruit arrivals." }
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex justify-between items-center py-3 border-b border-pink-50 last:border-0">
                        <div>
                          <h4 className="font-bold text-gray-800 text-xs sm:text-sm">{label}</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                            notifications[key] ? "bg-pink-500" : "bg-gray-200"
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications[key] ? "translate-x-6" : "translate-x-1"
                          }`} />
                        </button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

          </main>
        </div>

      </div>
    </div>
  );
}
