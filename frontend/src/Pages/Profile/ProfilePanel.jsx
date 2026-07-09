import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, fetchAddresses } from "@/features/auth/authSlice";
import { fetchUnreadCount } from "@/features/notifications/notificationSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  User as UserIcon,
  ShoppingBag,
  Heart,
  MapPin,
  Wallet,
  Bell,
  Shield,
  Fingerprint,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldAlert,
  Gift
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Import modular dashboard components
import DashboardOverview from "./components/DashboardOverview";
import MyProfile from "./components/MyProfile";
import OrderHistory from "./components/OrderHistory";
import WishlistGrid from "./components/WishlistGrid";
import AddressBook from "./components/AddressBook";
import SecuritySettings from "./components/SecuritySettings";
import PasskeyManager from "./components/PasskeyManager";
import NotificationsCenter from "./components/NotificationsCenter";
import DashboardSettings from "./components/DashboardSettings";

export default function ProfilePanel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading } = useSelector((state) => state.auth);
  const wishlistIds = useSelector((state) => state.wishlist.wishlistItems);
  const cartItems = useSelector((state) => state.cart.cartItems);

  // Active Tab: dashboard | profile | orders | wishlist | addresses | wallet | notifications | security | passkeys | settings
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync addresses on mount
  useEffect(() => {
    if (user) {
      dispatch(fetchAddresses());
    }
  }, [dispatch]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-background py-12 text-center transition-colors">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <h2 className="text-xl font-bold text-foreground">Loading your account details...</h2>
      </div>
    );
  }

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
    toast.success("Logged out successfully.");
  };

  // Navigation Items
  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "profile", label: "My Profile", icon: UserIcon },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "wishlist", label: "Wishlist", icon: Heart, badge: wishlistIds.length },
    { key: "addresses", label: "Saved Addresses", icon: MapPin, badge: user.addresses?.length || 0 },
    { key: "wallet", label: "Wallet (Soon)", icon: Wallet, disabled: true },
    { key: "notifications", label: "Notifications", icon: Bell, badge: 1 }, // mockup unread count
    { key: "security", label: "Security", icon: Shield },
    { key: "passkeys", label: "Passkeys", icon: Fingerprint, badge: user.passkeys?.length || 0 },
    { key: "settings", label: "Settings", icon: SettingsIcon },
  ];

  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Dashboard Overview";
      case "profile": return "My Profile Details";
      case "orders": return "Order History";
      case "wishlist": return "My Saved Favorites";
      case "addresses": return "Address Book Manager";
      case "wallet": return "Bakery Wallet & Balance";
      case "notifications": return "Notification Alerts";
      case "security": return "Account Security Control";
      case "passkeys": return "Biometric Security Keys";
      case "settings": return "System Preferences Settings";
      default: return "Account Dashboard";
    }
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview user={user} wishlistCount={wishlistIds.length} onNavigateTab={setActiveTab} />;
      case "profile":
        return <MyProfile user={user} />;
      case "orders":
        return <OrderHistory />;
      case "wishlist":
        return <WishlistGrid wishlistedCakes={wishlistedCakes} />;
      case "addresses":
        return <AddressBook user={user} />;
      case "security":
        return <SecuritySettings user={user} />;
      case "passkeys":
        return <PasskeyManager user={user} />;
      case "notifications":
        return <NotificationsCenter user={user} />;
      case "settings":
        return <DashboardSettings user={user} />;
      case "wallet":
        return (
          <div className="border border-dashed border-border rounded-3xl p-12 text-center space-y-4 bg-card">
            <Wallet className="h-12 w-12 text-muted-foreground/40 mx-auto animate-bounce" />
            <h3 className="font-extrabold text-foreground text-lg">Bakery Wallet is Coming Soon!</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              In a future update, you'll be able to load credits, buy dessert gift cards, and track checkout balances directly.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  // Avatar path helper
  const avatarUrl = user.profileImage 
    ? (user.profileImage.startsWith("http") ? user.profileImage : `http://localhost:5000${user.profileImage}`)
    : null;

  return (
    <div className="bg-background min-h-screen py-6 sm:py-12 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start relative">
          
          {/* DESKTOP SIDEBAR (lg+) */}
          <aside className="hidden lg:flex flex-col bg-card rounded-3xl border border-border shadow-sm p-5 space-y-6 text-left sticky top-24">
            {/* User Profile Summary Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-border/60">
              <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center overflow-hidden flex-shrink-0 bg-background shadow-inner">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-pink-500 to-purple-600 text-white font-extrabold text-lg flex items-center justify-center">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-foreground truncate flex items-center gap-1">
                  {user.name || "Customer"}
                </h3>
                <p className="text-[11px] text-muted-foreground font-semibold truncate leading-none mt-0.5">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <Badge className="bg-primary/20 text-primary border border-primary/30 text-[9px] py-0 px-1 pointer-events-none uppercase font-bold">VIP Member</Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] py-0 px-1 pointer-events-none capitalize font-semibold">{user.accountStatus || "active"}</Badge>
                </div>
              </div>
            </div>

            {/* Loyalty points quick widget */}
            <div className="bg-secondary/40 border border-border p-3.5 rounded-2xl flex items-center justify-between gap-2">
              <div className="space-y-0.5 text-left">
                <span className="text-[9px] font-black uppercase text-primary tracking-wider">Bakery Points</span>
                <p className="text-xs font-bold text-foreground">{user.loyaltyPoints || 0} Points</p>
              </div>
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                <Gift className="h-4.5 w-4.5" />
              </div>
            </div>

            {/* Sidebar navigation list */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;

                return (
                  <button
                    key={item.key}
                    disabled={item.disabled}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/15 scale-[1.01]"
                        : item.disabled
                        ? "text-muted-foreground/50 cursor-not-allowed"
                        : "text-muted-foreground hover:bg-secondary hover:text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                        {item.badge > 0 && (
                          <span className={`absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full text-[9px] font-black flex items-center justify-center shadow-sm border-2 animate-in zoom-in duration-300 ${
                            isActive ? 'bg-primary-foreground text-primary border-primary' : 'bg-primary text-primary-foreground border-card'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors mt-2"
              >
                <LogOut className="h-4.5 w-4.5 flex-shrink-0" />
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* MOBILE NAVIGATION DRAWER SIDEBAR */}
          <AnimatePresence>
            {mobileSidebarOpen && (
              <>
                {/* Backdrop */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileSidebarOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
                />

                {/* Drawer Container */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 20 }}
                  className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-card border-r border-border shadow-2xl z-[110] lg:hidden p-5 flex flex-col justify-between"
                >
                  <div className="space-y-6 flex-1 overflow-y-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <span className="font-extrabold text-base text-foreground flex items-center gap-1.5">
                        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                        Account Menu
                      </span>
                      <button 
                        onClick={() => setMobileSidebarOpen(false)}
                        className="p-1 text-muted-foreground hover:bg-secondary rounded-lg"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* User info */}
                    <div className="flex items-center gap-3 bg-secondary/20 p-3 rounded-2xl">
                      <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center overflow-hidden bg-background">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-pink-500 to-purple-600 text-white font-extrabold text-sm flex items-center justify-center">
                            {user.name ? user.name[0].toUpperCase() : "U"}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <h4 className="text-xs font-black text-foreground truncate">{user.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-semibold truncate mt-0.5">{user.email}</p>
                      </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="space-y-1">
                      {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.key;

                        return (
                          <button
                            key={item.key}
                            disabled={item.disabled}
                            onClick={() => { setActiveTab(item.key); setMobileSidebarOpen(false); }}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-black transition-all ${
                              isActive
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                                : item.disabled
                                ? "text-muted-foreground/45 cursor-not-allowed"
                                : "text-muted-foreground hover:bg-secondary hover:text-primary"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                                {item.badge > 0 && (
                                  <span className={`absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full text-[9px] font-black flex items-center justify-center shadow-sm border-2 animate-in zoom-in duration-300 ${
                                    isActive ? 'bg-primary-foreground text-primary border-primary' : 'bg-primary text-primary-foreground border-card'
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <span>{item.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Footer Logout */}
                  <div className="pt-4 border-t border-border mt-auto">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors justify-center"
                    >
                      <LogOut className="h-4.5 w-4.5" />
                      <span>Sign Out Account</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* MAIN WORKING CONTENT AREA */}
          <main className="col-span-1 lg:col-span-3 space-y-6">
            {/* Header controls for mobile view */}
            <div className="flex items-center justify-between lg:hidden border border-border p-4 bg-card rounded-2xl shadow-sm text-left">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase text-primary tracking-wider">Account Portal</span>
                <h2 className="text-sm font-extrabold text-foreground">{getTabTitle()}</h2>
              </div>
              <Button 
                onClick={() => setMobileSidebarOpen(true)} 
                variant="outline" 
                size="sm" 
                className="rounded-xl border-border hover:bg-secondary h-9 w-9 p-0 flex items-center justify-center"
              >
                <Menu className="h-5 w-5 text-foreground" />
              </Button>
            </div>

            {/* Active workspace display component with page transitions */}
            <div className="min-h-[50vh]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  {renderActiveContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
