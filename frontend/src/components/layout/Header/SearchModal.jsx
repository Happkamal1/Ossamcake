import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Handle escape key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-card rounded-3xl shadow-2xl p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-extrabold text-foreground mb-4 px-2">What are you craving?</h2>
        
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            autoFocus
            type="text"
            placeholder="Search chocolate, red velvet, wedding cakes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary border-border focus-visible:ring-ring pl-12 h-14 rounded-2xl text-base shadow-inner"
          />
        </form>

        <div className="mt-6 px-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Popular Searches</p>
          <div className="flex flex-wrap gap-2">
            {["Birthday Cakes", "Chocolate Truffle", "Red Velvet", "Eggless Options"].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setSearchQuery(term);
                  navigate(`/shop?search=${encodeURIComponent(term)}`);
                  onClose();
                }}
                className="px-4 py-2 bg-secondary text-primary hover:bg-secondary hover:text-primary/90 rounded-full text-xs font-semibold transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
