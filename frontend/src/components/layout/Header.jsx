import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import {
  CakeSlice,
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Gift,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CATEGORIES = [
  "Birthday Cakes",
  "Wedding Cakes",
  "Anniversary Cakes",
  "Photo Cakes",
  "Kids Cakes",
  "Premium Cakes"
];

export default function Header() {
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const totalCartQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 text-white text-center py-2 px-4 text-xs font-medium flex items-center justify-center gap-2">
        <Gift className="h-3.5 w-3.5 animate-bounce" />
        <span>Free delivery on orders over $80! Use code <strong className="underline text-yellow-300">WELCOME10</strong> for 10% off</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-gray-700 hover:text-pink-500 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CakeSlice className="h-5.5 w-5.5 text-pink-500" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            OssamCake
          </span>
        </Link>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search chocolate, red velvet, wedding cakes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-pink-50/50 border-pink-100 hover:bg-pink-50 focus-visible:ring-pink-400 pl-10 rounded-full text-sm"
            />
          </div>
        </form>

        {/* Navigation & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Shop Megamenu - Desktop */}
          <nav className="hidden md:flex items-center gap-6 mr-4 text-sm font-semibold text-gray-600">
            <Link to="/shop" className="hover:text-pink-500 transition-colors">Shop</Link>
            
            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-pink-500 transition-colors focus:outline-none">
                Categories <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-white border border-pink-100 rounded-xl p-1 shadow-lg">
                {CATEGORIES.map((cat) => (
                  <DropdownMenuItem key={cat} asChild>
                    <Link
                      to={`/shop?category=${encodeURIComponent(cat)}`}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg cursor-pointer transition-colors"
                    >
                      {cat}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/offers" className="hover:text-pink-500 transition-colors text-pink-600">Offers</Link>
            <Link to="/about" className="hover:text-pink-500 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-pink-500 transition-colors">Contact</Link>
          </nav>

          {/* Wishlist */}
          <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-all">
            <Heart className="h-5.5 w-5.5" />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative p-2 text-gray-700 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-all">
            <ShoppingBag className="h-5.5 w-5.5" />
            {totalCartQty > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                {totalCartQty}
              </span>
            )}
          </Link>

          {/* User Auth Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 p-1 rounded-full border border-pink-100 hover:bg-pink-50 focus:outline-none transition-colors">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white font-bold text-xs flex items-center justify-center shadow-inner">
                  {user ? `${user.firstName[0]}${user.lastName[0]}` : <User className="h-4 w-4" />}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-pink-100 rounded-xl p-1.5 shadow-lg">
              {user ? (
                <>
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-gray-400">
                    Hello, {user.firstName}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-pink-50" />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg cursor-pointer flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" /> My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile/orders" className="px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg cursor-pointer flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-gray-400" /> My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-pink-50" />
                  <DropdownMenuItem onClick={logout} className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg cursor-pointer flex items-center gap-2">
                    <LogOut className="h-4 w-4 text-red-400" /> Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/login" className="px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg cursor-pointer">
                      Login
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/signup" className="px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg cursor-pointer">
                      Signup
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search & Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-pink-100 bg-white p-4 space-y-4 shadow-inner">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search cakes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-pink-50/50 pl-10 rounded-full text-sm"
            />
          </form>
          <div className="flex flex-col gap-3 font-semibold text-gray-700 text-sm">
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="hover:text-pink-500 py-1 transition-colors">Shop</Link>
            <div className="py-1">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1">Categories</span>
              <div className="grid grid-cols-2 gap-2 pl-2">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    to={`/shop?category=${encodeURIComponent(cat)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs hover:text-pink-500 py-1 text-gray-600 transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/offers" onClick={() => setMobileMenuOpen(false)} className="text-pink-600 py-1 transition-colors">Special Offers</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-pink-500 py-1 transition-colors">About Us</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-pink-500 py-1 transition-colors">Contact Support</Link>
          </div>
        </div>
      )}
    </header>
  );
}
