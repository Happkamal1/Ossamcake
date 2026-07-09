import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ChevronDown, ChevronRight, Search } from "lucide-react";
import { MAIN_NAV } from "@/config/navigation";
import ThemeSwitcher from "@/components/shared/ThemeSwitcher";

export default function MobileNav({ isOpen, onClose, onSearchOpen }) {
  const [openDropdown, setOpenDropdown] = useState(null);

  // Handle escape key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Reset dropdown when menu closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setOpenDropdown(null), 300); // Wait for transition
    }
  }, [isOpen]);

  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity md:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-[110] w-[85%] max-w-sm bg-background h-[100dvh] shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50 shrink-0 bg-background">
          <span className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <img src="/images/logo/logo.png" alt="OssamCake" className="h-16 object-contain" />
          </span>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground hover:rotate-90 rounded-full transition-all duration-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 min-h-0 bg-background">
          <nav className="flex flex-col px-5 space-y-2">
            {MAIN_NAV.map((item, idx) => {
              const isExpanded = openDropdown === item.label;

              return (
                <div
                  key={idx}
                  className={`transform transition-all duration-500 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                  style={{ transitionDelay: `${isOpen ? 100 + idx * 75 : 0}ms` }}
                >
                  {item.isDropdown ? (
                    <div className="flex flex-col border-b border-border/50 last:border-0 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleDropdown(item.label)}
                        className={`flex items-center justify-between p-4 text-base font-bold text-foreground hover:text-primary hover:bg-primary/5 transition-colors ${isExpanded ? "bg-primary/5 text-primary" : ""}`}
                      >
                        {item.label}
                        <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? "rotate-180 text-primary" : ""}`} />
                      </button>

                      {/* Dropdown Items with Staggered Animation */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[400px] opacity-100 mb-2" : "max-h-0 opacity-0"
                          }`}
                      >
                        <div className="flex flex-col pl-4 pr-2 py-2 space-y-1 border-l-2 border-primary/20 ml-4 mt-2">
                          {item.items.map((subItem, subIdx) => (
                            <Link
                              key={subIdx}
                              to={subItem.href}
                              onClick={onClose}
                              className="text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 p-2 rounded-lg flex items-center gap-3 transition-colors"
                            >
                              <ChevronRight className="h-3 w-3 text-pink-400" />
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className="flex items-center p-4 border-b border-border/50 last:border-0 rounded-xl text-base font-bold text-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer in Drawer */}
        <div
          className={`p-6 border-t border-border/50 bg-secondary/30 shrink-0 transform transition-all duration-700 delay-300 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => { onClose(); onSearchOpen?.(); }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 rounded-xl transition-all hover:scale-105 active:scale-95 w-full justify-center mr-3"
            >
              <Search className="h-4 w-4" />
              Search Products
            </button>
            <div className="bg-background p-1.5 rounded-xl shadow-sm border border-border">
              <ThemeSwitcher />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
            <span className="w-8 h-[1px] bg-border"></span>
            Premium Handcrafted Cakes
            <span className="w-8 h-[1px] bg-border"></span>
          </div>
        </div>
      </div>
    </>
  );
}
