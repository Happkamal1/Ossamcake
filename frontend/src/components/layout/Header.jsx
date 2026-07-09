import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/context/AuthContext";
import {
  CakeSlice,
  Search,
  Heart,
  ShoppingBag,
  Menu,
  Gift
} from "lucide-react";

import DesktopNav from "./Header/DesktopNav";
import MobileNav from "./Header/MobileNav";
import SearchModal from "./Header/SearchModal";
import UserDropdown from "./Header/UserDropdown";
import ThemeSwitcher from "@/components/shared/ThemeSwitcher";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function Header() {
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const totalCartQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-500">
      {/* Top Announcement Bar */}
      <div className="bg-primary text-primary-foreground text-center py-1.5 sm:py-2 px-3 sm:px-4 text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 tracking-wide transition-colors duration-500">
        <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-bounce text-accent flex-shrink-0" />
        <span>Free delivery on orders over $80! Use code <strong className="underline text-accent">WELCOME10</strong> for 10% off</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 -ml-2 text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-200 active:scale-90 focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group flex-1 lg:flex-none min-w-0">
          <img src="/images/logo/logo.png" alt="OssamCake" className="h-[100px] object-contain" />
        </Link>

        {/* Center Desktop Navigation */}
        <div className="hidden lg:flex flex-1 justify-center">
          <DesktopNav />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">

          {/* Search — hidden on mobile, shown on sm+ */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="hidden sm:flex p-2 text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-full transition-all focus:outline-none"
            aria-label="Search"
          >
            <Search className="h-5.5 w-5.5" />
          </button>

          {/* Wishlist */}
          <Link to="/wishlist" className="relative p-1.5 sm:p-2 text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-full transition-all flex items-center justify-center group">
            <Heart className="h-5 w-5 sm:h-5.5 sm:w-5.5 group-hover:scale-110 transition-transform" />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary text-primary-foreground text-[9px] sm:text-[10px] font-black flex items-center justify-center shadow-sm border-2 border-background animate-in zoom-in duration-300">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative p-1.5 sm:p-2 text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-full transition-all flex items-center justify-center group">
            <ShoppingBag className="h-5 w-5 sm:h-5.5 sm:w-5.5 group-hover:scale-110 transition-transform" />
            {totalCartQty > 0 && (
              <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary text-primary-foreground text-[9px] sm:text-[10px] font-black flex items-center justify-center shadow-sm border-2 border-background animate-in zoom-in duration-300">
                {totalCartQty}
              </span>
            )}
          </Link>

          {/* Theme Switcher — hidden on mobile, shown on sm+ */}
          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Auth Dropdown */}
          <div className="pl-1 sm:pl-2 sm:border-l sm:border-border">
            <UserDropdown user={user} logout={logout} />
          </div>

        </div>
      </div>

      {/* Modals & Overlays */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onSearchOpen={() => setSearchModalOpen(true)}
      />

    </header>
  );
}