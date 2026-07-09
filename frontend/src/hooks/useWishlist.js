import { useSelector, useDispatch } from "react-redux";
import {
  fetchWishlist,
  addToWishlistAsync,
  removeFromWishlistAsync,
  clearWishlistAsync,
  selectWishlistItems,
  selectWishlistCount,
  selectIsInWishlist,
} from "@/features/wishlist/wishlistSlice";

export function useWishlist() {
  const dispatch = useDispatch();
  const wishlistItems = useSelector(selectWishlistItems);
  const wishlistCount = useSelector(selectWishlistCount);

  const getWishlist = (params) => dispatch(fetchWishlist(params));
  const addToWishlist = (productId) => dispatch(addToWishlistAsync(productId));
  const removeFromWishlist = (productId) => dispatch(removeFromWishlistAsync(productId));
  const clearWishlist = () => dispatch(clearWishlistAsync());
  
  const isInWishlist = (productId) => {
    return wishlistItems.some(
      (item) =>
        item._id === productId ||
        item.slug === productId ||
        item.id === productId
    );
  };

  const toggleWishlist = (productId) => {
    const isSaved = isInWishlist(productId);
    if (isSaved) {
      // Find the database ID if productId is a slug
      const item = wishlistItems.find(
        (i) => i._id === productId || i.slug === productId || i.id === productId
      );
      const dbId = item?._id || productId;
      return dispatch(removeFromWishlistAsync(dbId));
    } else {
      return dispatch(addToWishlistAsync(productId));
    }
  };

  return {
    wishlistItems,
    wishlistCount,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    toggleWishlist,
  };
}
