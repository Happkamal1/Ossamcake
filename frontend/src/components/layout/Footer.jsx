import { useState } from "react";
import { Link } from "react-router-dom";
import { CakeSlice, Mail, Phone, MapPin, Send, Instagram, Facebook, Twitter, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#2D2D2D] text-gray-300 border-t-4 border-pink-500 pt-16 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand Info */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-2xl">
            <div className="h-10 w-10 rounded-full bg-pink-500 flex items-center justify-center">
              <CakeSlice className="h-5.5 w-5.5 text-white" />
            </div>
            <span className="text-white">OssamCake</span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed">
            Crafting premium, luxury celebrations with sweet elegance. Every cake is baked with fresh, organic ingredients and hand-finished by master pastry artists.
          </p>
          <div className="flex gap-4 pt-2">
            {[
              { icon: Instagram, href: "#" },
              { icon: Facebook, href: "#" },
              { icon: Twitter, href: "#" }
            ].map(({ icon: Icon, href }, idx) => (
              <a
                key={idx}
                href={href}
                className="h-9 w-9 rounded-full bg-gray-800 hover:bg-pink-500 hover:text-white flex items-center justify-center text-gray-400 transition-colors shadow-inner"
              >
                <Icon className="h-4.5 w-4.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4 border-b border-gray-800 pb-2">Quick Links</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/shop" className="hover:text-pink-400 transition-colors">Our Menu</Link>
            </li>
            <li>
              <Link to="/shop?category=Birthday Cakes" className="hover:text-pink-400 transition-colors">Birthday Cakes</Link>
            </li>
            <li>
              <Link to="/shop?category=Wedding Cakes" className="hover:text-pink-400 transition-colors">Wedding Cakes</Link>
            </li>
            <li>
              <Link to="/offers" className="hover:text-pink-400 transition-colors">Seasonal Offers</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-pink-400 transition-colors">Our Story</Link>
            </li>
            <li>
              <Link to="/career" className="hover:text-pink-400 transition-colors">Careers</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4 border-b border-gray-800 pb-2">Contact Details</h3>
          <ul className="space-y-3.5 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-pink-500 shrink-0 mt-0.5" />
              <span className="text-gray-400">123 Baker Street, Manhattan, New York, NY 10001</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-pink-500 shrink-0" />
              <span className="text-gray-400">+1 (555) 123-4567</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-pink-500 shrink-0" />
              <span className="text-gray-400">hello@ossamcake.com</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-lg border-b border-gray-800 pb-2">Subscribe</h3>
          <p className="text-sm text-gray-400">
            Sign up to receive sweet updates, new arrivals, and exclusive VIP discounts.
          </p>
          {subscribed ? (
            <div className="rounded-lg bg-pink-950/30 border border-pink-850 p-3 text-pink-400 text-xs font-semibold">
              ✓ Subscribed! Welcome to the family.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-gray-800 border-gray-700 text-gray-200 focus-visible:ring-pink-500 rounded-lg text-sm"
              />
              <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-4 rounded-lg">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-850 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-500 text-center sm:text-left">
          &copy; {new Date().getFullYear()} OssamCake. All rights reserved. Handcrafted by premium pastry developers.
        </p>
        
        {/* Secure Checkout / Payment partners */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-green-500" /> Secure SSL Checkout
          </span>
          <div className="flex gap-2">
            {["Visa", "Mastercard", "Paypal", "Apple Pay"].map((p) => (
              <span key={p} className="px-2 py-0.5 rounded bg-gray-800 text-[10px] text-gray-400 font-bold border border-gray-750">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
