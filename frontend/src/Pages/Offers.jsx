import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gift, Percent, Copy, Check, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/api";

const COUPONS = [
  { code: "WELCOME10", discount: "10% OFF", desc: "Enjoy 10% discount on your first order. Minimum order value $30.", validity: "Valid for all new users" },
  { code: "BDAY15", discount: "15% OFF", desc: "Special birthday celebration code. Valid on birthday cakes.", validity: "Expires on Dec 31, 2026" },
  { code: "SWEET20", discount: "20% OFF", desc: "Unlock 20% discount on order totals exceeding $150.", validity: "Limited period deal" }
];

const COMBOS = [
  {
    title: "Double Chocolate & Party Cap Combo",
    price: "$45.99",
    oldPrice: "$52.99",
    desc: "Order 1kg Chocolate Fudge cake and receive a set of premium birthday candles and metallic party caps free.",
    image: "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/products/chocolate-fudge.jpg"
  },
  {
    title: "Royal Red Velvet & Rose Gift Set",
    price: "$55.00",
    oldPrice: "$65.00",
    desc: "Combine our signature Red Velvet Cake with a customized greeting card and fresh floral wrapping.",
    image: "https://ossamcake-images-713877988783-ap-south-1-an.s3.ap-south-1.amazonaws.com/products/red-velvet.jpg"
  }
];

export default function Offers() {
  const [copiedCode, setCopiedCode] = useState("");

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(""), 3000);
  };

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">VIP Offers & Sweet Deals</h1>
          <p className="text-sm text-muted-foreground">Apply these exclusive discounts to save on your custom cake orders.</p>
        </div>

        {/* 1. Active Coupons */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground text-left border-b border-border pb-3 flex items-center gap-2">
            <Gift className="h-5.5 w-5.5 text-primary" /> Active Promo Codes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COUPONS.map((coupon, idx) => {
              const isCopied = copiedCode === coupon.code;
              return (
                <div
                  key={idx}
                  className="bg-card rounded-3xl p-6 border border-border shadow-sm text-left flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 h-16 w-16 bg-secondary rounded-bl-full flex items-center justify-center pr-3 pb-3">
                    <Percent className="h-5 w-5 text-primary/60" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-primary bg-secondary px-2.5 py-0.5 rounded-full border border-border">
                      {coupon.discount}
                    </span>
                    <h3 className="font-bold text-foreground text-lg">{coupon.code}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-normal">{coupon.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">{coupon.validity}</span>
                    <button
                      onClick={() => handleCopyCode(coupon.code)}
                      className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                        isCopied
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-secondary border-border text-primary hover:bg-secondary"
                      }`}
                    >
                      {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span>{isCopied ? "Copied" : "Copy Code"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. Combo Deals */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground text-left border-b border-border pb-3 flex items-center gap-2">
            <Sparkles className="h-5.5 w-5.5 text-primary" /> Curated Party Combo Vouchers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {COMBOS.map((combo, idx) => (
              <div
                key={idx}
                className="bg-card rounded-3xl p-6 border border-border shadow-sm text-left grid grid-cols-1 sm:grid-cols-3 gap-6 items-center"
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-secondary border border-border">
                  <img src={getImageUrl(combo.image)} alt={combo.title} className="h-full w-full object-cover" />
                </div>
                <div className="sm:col-span-2 space-y-4 flex flex-col justify-between h-full">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-foreground text-base sm:text-lg line-clamp-1">{combo.title}</h3>
                    <p className="text-xs text-muted-foreground leading-normal font-normal">{combo.desc}</p>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-muted-foreground line-through text-xs">{combo.oldPrice}</span>
                      <span className="text-lg font-black text-primary">{combo.price}</span>
                    </div>
                    <Button asChild size="sm" className="bg-primary hover:bg-primary rounded-full font-bold">
                      <Link to="/shop">Order Combo</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
