import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/features/products/productSlice";
import { metaApi } from "@/features/products/productApi";
import ProductCard from "@/components/product/ProductCard";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Search, Filter, RotateCcw, LayoutGrid, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const FLAVORS = [
  "All Flavors",
  "Hazelnut Chocolate Praline",
  "Classic Dark Chocolate",
  "Classic Cherry & Chocolate",
  "Double Chocolate Fudge",
  "Classic Vanilla Buttercream",
  "Tropical Fresh Fruit",
  "Alphonso Mango Cream",
  "Royal Red Velvet",
  "Madagascar Vanilla Bean"
];

export default function Shop() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: cakes, loading } = useSelector((state) => state.products);
  const [categories, setCategories] = useState([]);

  // State from URL Search Params
  const categoryParam = searchParams.get("category") || "All Cakes";
  const searchParam = searchParams.get("search") || "";

  // Local Filter States
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedFlavor, setSelectedFlavor] = useState("All Flavors");
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [priceRange, setPriceRange] = useState([300]); // Max price upper cap (default 300)
  const [sortBy, setSortBy] = useState("rating-desc");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Load Categories dynamically from MongoDB Atlas (public endpoint, no auth)
  useEffect(() => {
    metaApi.getCategories()
      .then((res) => {
        setCategories(res.data.data || []);
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  // Fetch Products dynamically based on filters
  useEffect(() => {
    const params = {
      category: selectedCategory !== "All Cakes" ? selectedCategory : undefined,
      flavor: selectedFlavor !== "All Flavors" ? selectedFlavor : undefined,
      search: searchQuery || undefined,
      maxPrice: priceRange[0],
      sort: sortBy,
    };
    dispatch(fetchProducts(params));
  }, [dispatch, selectedCategory, selectedFlavor, searchQuery, priceRange, sortBy]);

  // Sync state if URL params change
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  const handleResetFilters = () => {
    setSelectedCategory("All Cakes");
    setSelectedFlavor("All Flavors");
    setSearchQuery("");
    setPriceRange([300]);
    setSortBy("rating-desc");
    setSearchParams({});
  };

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    if (catName === "All Cakes") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", catName);
    }
    setSearchParams(searchParams);
  };

  const FilterContent = (
    <div className="space-y-8">
      {/* Search filter input */}
      <div className="space-y-3 text-left">
        <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
          <Search className="h-4 w-4 text-primary" /> Search Cakes
        </h4>
        <Input
          type="text"
          placeholder="Type flavor name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-secondary border-border focus-visible:ring-ring"
        />
      </div>

      {/* Categories list */}
      <div className="space-y-3 text-left">
        <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
          <LayoutGrid className="h-4 w-4 text-primary" /> Celebrations
        </h4>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => handleCategorySelect("All Cakes")}
            className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === "All Cakes"
                ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-secondary hover:text-primary"
            }`}
          >
            All Cakes
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategorySelect(cat.name)}
              className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.name
                  ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/10"
                  : "text-muted-foreground hover:bg-secondary hover:text-primary"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Flavors dropdown */}
      <div className="space-y-3 text-left">
        <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
          <Filter className="h-4 w-4 text-primary" /> Cake Flavor
        </h4>
        <select
          value={selectedFlavor}
          onChange={(e) => setSelectedFlavor(e.target.value)}
          className="w-full text-xs font-semibold bg-secondary border border-border rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
        >
          {FLAVORS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Price slider */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-foreground text-sm">Max Price</h4>
          <span className="text-xs font-extrabold text-primary bg-secondary px-2.5 py-0.5 rounded-full border border-border">
            ₹{priceRange[0]}
          </span>
        </div>
        <Slider
          min={20}
          max={3000}
          step={50}
          value={priceRange}
          onValueChange={setPriceRange}
          className="text-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
          <span>₹20</span>
          <span>₹3000</span>
        </div>
      </div>

      {/* Reset Button */}
      <Button
        onClick={handleResetFilters}
        variant="outline"
        className="w-full border-border hover:bg-secondary text-primary rounded-xl font-bold flex items-center justify-center gap-1.5"
      >
        <RotateCcw className="h-4 w-4" /> Reset Filters
      </Button>
    </div>
  );

  return (
    <div className="bg-background min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Page Title */}
        <div className="text-left space-y-2 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Our Gourmet Cake Catalog
          </h1>
          <p className="text-sm text-muted-foreground">
            Showing {cakes.length} artisanal cakes crafted for unforgettable moments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block space-y-8 bg-card p-6 rounded-3xl border border-border shadow-sm h-fit sticky top-24">
            {FilterContent}
          </aside>

          {/* Main Products Grid */}
          <main className="lg:col-span-3 space-y-6">
            
            {/* Sorting controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-3xl border border-border shadow-sm">
              <div className="flex items-center justify-between w-full sm:w-auto">
                <span className="text-xs font-semibold text-muted-foreground">
                  Showing <strong className="text-foreground font-bold">{cakes.length}</strong> results
                </span>
                
                <Button 
                  onClick={() => setIsMobileFilterOpen(true)}
                  variant="outline" 
                  className="lg:hidden flex items-center gap-2 h-8 text-xs rounded-xl border-border bg-secondary hover:bg-secondary/80 text-primary font-bold px-4"
                >
                  <Filter className="h-3 w-3" /> Filters
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-semibold shrink-0">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-bold bg-secondary border border-border rounded-xl px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                >
                  <option value="rating-desc">Top Rated</option>
                  <option value="reviews-desc">Most Reviews</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading gourmet cakes...</p>
              </div>
            ) : cakes.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-3xl border border-border shadow-sm space-y-4">
                <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                  <Filter className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-extrabold text-foreground text-lg">No Cakes Match Your Filters</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Try typing a different name, adjusting the price slider, or resetting parameters.
                </p>
                <Button onClick={handleResetFilters} className="bg-primary hover:bg-primary rounded-xl font-bold">
                  Reset Search
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cakes.map((cake) => (
                  <ProductCard key={cake.id} cake={cake} />
                ))}
              </div>
            )}
          </main>
        </div>

      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className={`fixed inset-y-0 right-0 z-[110] w-[85%] max-w-sm bg-background h-[100dvh] shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden flex flex-col ${
            isMobileFilterOpen ? "translate-x-0" : "translate-x-full"
          }`}>
             {/* Header */}
             <div className="flex items-center justify-between p-5 border-b border-border/50 shrink-0 bg-background">
               <h3 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                 <Filter className="h-5 w-5 text-primary" /> Filters
               </h3>
               <button 
                 onClick={() => setIsMobileFilterOpen(false)}
                 className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground hover:rotate-90 rounded-full transition-all duration-300"
               >
                 <X className="h-6 w-6" />
               </button>
             </div>
             
             {/* Scrollable Filters Content */}
             <div className="flex-1 overflow-y-auto p-5 min-h-0 bg-background hide-scrollbar">
                {FilterContent}
             </div>
             
             {/* Footer */}
             <div className="p-5 border-t border-border/50 bg-secondary/30 shrink-0">
               <Button onClick={() => setIsMobileFilterOpen(false)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-12 shadow-md shadow-primary/20">
                 Apply Filters
               </Button>
             </div>
          </div>
        </>
      )}
    </div>
  );
}
