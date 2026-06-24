import { createContext, useState, useEffect, useContext } from "react";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);

  // Load wishlist from LocalStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("cake_wishlist_items");
    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Error loading wishlist items", e);
      }
    }
  }, []);

  // Save wishlist to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem("cake_wishlist_items", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const toggleWishlist = (cakeId) => {
    setWishlistItems((prevItems) => {
      if (prevItems.includes(cakeId)) {
        return prevItems.filter((id) => id !== cakeId);
      } else {
        return [...prevItems, cakeId];
      }
    });
  };

  const isInWishlist = (cakeId) => {
    return wishlistItems.includes(cakeId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.removeItem("cake_wishlist_items");
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
