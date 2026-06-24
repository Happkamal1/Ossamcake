import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { cakesData } from "@/data/cakesData";
import ProductCard from "@/components/product/ProductCard";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Search, Filter, RotateCcw, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  "All Cakes",
  "Birthday Cakes",
  "Wedding Cakes",
  "Anniversary Cakes",
  "Photo Cakes",
  "Kids Cakes",
  "Premium Cakes"
];

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
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State from URL Search Params
  const categoryParam = searchParams.get("category") || "All Cakes";
  const searchParam = searchParams.get("search") || "";

  // Local Filter States
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedFlavor, setSelectedFlavor] = useState("All Flavors");
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [priceRange, setPriceRange] = useState([300]); // Max price upper cap (default 300)
  const [sortBy, setSortBy] = useState("rating-desc");

  // Sync state if URL params change
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  // Extract products matching filter logic
  const filteredCakes = cakesData.filter((cake) => {
    // 1. Search Query Match
    const matchesSearch = searchQuery
      ? cake.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cake.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    // 2. Category Match
    const matchesCategory =
      selectedCategory === "All Cakes"
        ? true
        : cake.categories?.includes(selectedCategory);

    // 3. Flavor Match
    const matchesFlavor =
      selectedFlavor === "All Flavors"
        ? true
        : cake.variants?.some((v) => v.flavor.toLowerCase().includes(selectedFlavor.toLowerCase()));

    // 4. Price Match (Evaluate against minimum variant price or base price)
    const matchesPrice = cake.basePrice <= priceRange[0];

    return matchesSearch && matchesCategory && matchesFlavor && matchesPrice;
  });

  // Sort logic
  const sortedCakes = [...filteredCakes].sort((a, b) => {
    const finalPriceA = a.basePrice * (1 - (a.discount || 0) / 100);
    const finalPriceB = b.basePrice * (1 - (b.discount || 0) / 100);

    if (sortBy === "price-asc") {
      return finalPriceA - finalPriceB;
    }
    if (sortBy === "price-desc") {
      return finalPriceB - finalPriceA;
    }
    if (sortBy === "rating-desc") {
      return b.rating - a.rating;
    }
    if (sortBy === "reviews-desc") {
      return b.reviewsCount - a.reviewsCount;
    }
    return 0;
  });

  const handleResetFilters = () => {
    setSelectedCategory("All Cakes");
    setSelectedFlavor("All Flavors");
    setSearchQuery("");
    setPriceRange([300]);
    setSortBy("rating-desc");
    setSearchParams({});
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setSearchParams({ category: cat });
  };

  return (
    <div className="bg-[#FFF8F9] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Page Title */}
        <div className="text-left space-y-2 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Our Gourmet Cake Catalog
          </h1>
          <p className="text-sm text-gray-500">
            Showing {sortedCakes.length} artisanal cakes crafted for unforgettable moments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="space-y-8 bg-white p-6 rounded-3xl border border-pink-50 shadow-sm h-fit">
            
            {/* Search filter input */}
            <div className="space-y-3 text-left">
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                <Search className="h-4 w-4 text-pink-500" /> Search Cakes
              </h4>
              <Input
                type="text"
                placeholder="Type flavor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-pink-50/20 border-pink-100 focus-visible:ring-pink-500"
              />
            </div>

            {/* Categories list */}
            <div className="space-y-3 text-left">
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                <LayoutGrid className="h-4 w-4 text-pink-500" /> Celebrations
              </h4>
              <div className="flex flex-col gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? "bg-pink-500 text-white font-bold shadow-md shadow-pink-100"
                        : "text-gray-600 hover:bg-pink-50 hover:text-pink-650"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Flavors dropdown */}
            <div className="space-y-3 text-left">
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-pink-500" /> Cake Flavor
              </h4>
              <select
                value={selectedFlavor}
                onChange={(e) => setSelectedFlavor(e.target.value)}
                className="w-full text-xs font-semibold bg-pink-50/20 border border-pink-100 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-pink-400 text-gray-700"
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
                <h4 className="font-bold text-gray-800 text-sm">Max Price</h4>
                <span className="text-xs font-extrabold text-pink-500 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100">
                  ${priceRange[0]}
                </span>
              </div>
              <Slider
                min={20}
                max={300}
                step={5}
                value={priceRange}
                onValueChange={setPriceRange}
                className="text-pink-500"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                <span>$20</span>
                <span>$300</span>
              </div>
            </div>

            {/* Reset Button */}
            <Button
              onClick={handleResetFilters}
              variant="outline"
              className="w-full border-pink-100 hover:bg-pink-50 text-pink-600 rounded-xl font-bold flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="h-4 w-4" /> Reset Filters
            </Button>
          </aside>

          {/* Main Products Grid */}
          <main className="lg:col-span-3 space-y-6">
            
            {/* Sorting controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-pink-50 shadow-sm">
              <span className="text-xs font-semibold text-gray-500">
                Showing <strong className="text-gray-800 font-bold">{sortedCakes.length}</strong> results
              </span>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-450 font-semibold shrink-0">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-bold bg-pink-50/20 border border-pink-100 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-pink-400 text-gray-700"
                >
                  <option value="rating-desc">Top Rated</option>
                  <option value="reviews-desc">Most Reviews</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products grid */}
            {sortedCakes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-pink-50 shadow-sm space-y-4">
                <div className="h-16 w-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto">
                  <Filter className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="font-extrabold text-gray-800 text-lg">No Cakes Match Your Filters</h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                  Try typing a different name, adjusting the price slider, or resetting parameters.
                </p>
                <Button onClick={handleResetFilters} className="bg-pink-500 hover:bg-pink-600 rounded-xl font-bold">
                  Reset Search
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCakes.map((cake) => (
                  <ProductCard key={cake.id} cake={cake} />
                ))}
              </div>
            )}
          </main>
        </div>

      </div>
    </div>
  );
}
