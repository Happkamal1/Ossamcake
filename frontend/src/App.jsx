import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AuthProvider } from "@/context/AuthContext";
import { fetchPublicSettings } from "@/features/siteSettings/siteSettingsSlice";

import { applyTheme } from "@/utils/applyTheme";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Home from "@/Pages/Home";
import Shop from "@/Pages/Shop";
import CakeDetails from "@/Pages/CakeDetails";
import Cart from "@/Pages/Cart";
import Checkout from "@/Pages/Checkout";
import TrackOrder from "@/Pages/TrackOrder";
import Offers from "@/Pages/Offers";
import About from "@/Pages/About";
import Contact from "@/Pages/Contact";
import Career from "@/Pages/Career";
import Login from "@/Pages/Login";
import Signup from "@/Pages/Signup";
import ForgotPassword from "@/Pages/ForgotPassword";
import ProfilePanel from "@/Pages/Profile/ProfilePanel";
import Wishlist from "@/Pages/Wishlist";
import NotFound from "@/Pages/NotFound";
import { Toaster } from "sonner";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

// Admin Panel Components
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import AdminLayout from "@/Pages/Admin/AdminLayout";
import AdminDashboard from "@/Pages/Admin/AdminDashboard";
import AdminProducts from "@/Pages/Admin/AdminProducts";
import AdminOrders from "@/Pages/Admin/AdminOrders";
import AdminUsers from "@/Pages/Admin/AdminUsers";
import AdminCategories from "@/Pages/Admin/AdminCategories";
import AdminOccasions from "@/Pages/Admin/AdminOccasions";
import AdminCakeTypes from "@/Pages/Admin/AdminCakeTypes";
import AdminReviews from "@/Pages/Admin/AdminReviews";
import AdminCoupons from "@/Pages/Admin/AdminCoupons";
import AdminBanners from "@/Pages/Admin/AdminBanners";
import AdminNotifications from "@/Pages/Admin/AdminNotifications";
import AdminFAQs from "@/Pages/Admin/AdminFAQs";
import AdminTestimonials from "@/Pages/Admin/AdminTestimonials";
import AdminSiteSettings from "@/Pages/Admin/AdminSiteSettings";
import NotificationsPage from "@/Pages/Notifications/NotificationsPage";
import NotificationDetailPage from "@/Pages/Notifications/NotificationDetailPage";

// Layout wrapper for all customer-facing pages (with Header and Footer)
function CustomerLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden w-full max-w-[100vw]">
      <Header />
      <main className="flex-1 w-full max-w-[100vw]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const activeTheme = useSelector((state) => state.theme.activeTheme);

  useEffect(() => {
    applyTheme(activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    dispatch(fetchPublicSettings());
  }, [dispatch]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin Dashboard Routes (Isolated, no Header/Footer) */}
          <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="occasions" element={<AdminOccasions />} />
            <Route path="cake-types" element={<AdminCakeTypes />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="faqs" element={<AdminFAQs />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="site-settings" element={<AdminSiteSettings />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Customer Facing Pages (Using standard nested layout wrapper) */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/cake/:id" element={<CakeDetails />} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/track-order" element={<ProtectedRoute><TrackOrder /></ProtectedRoute>} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/career" element={<Career />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Customer Portal */}
            <Route path="/profile/*" element={<ProtectedRoute><ProfilePanel /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

            {/* Notification Center */}
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/notifications/:slug" element={<ProtectedRoute><NotificationDetailPage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster 
          position="bottom-right" 
          richColors 
          theme="system"
          toastOptions={{
            style: {
              marginBottom: '20px',
            },
          }}
          style={{
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
