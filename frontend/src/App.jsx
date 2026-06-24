import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
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
import NotFound from "@/Pages/NotFound";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-[#FFF8F9]">
              <Header />
              <main className="flex-1">
                <Routes>
                  {/* Public Pages */}
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/cake/:id" element={<CakeDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/track-order" element={<TrackOrder />} />
                  <Route path="/offers" element={<Offers />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/career" element={<Career />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  
                  {/* Customer Portal */}
                  <Route path="/profile" element={<ProfilePanel />} />
                  
                  {/* Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
            <Toaster position="bottom-right" richColors />
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
