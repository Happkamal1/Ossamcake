import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { wishlistApi } from "./wishlistApi";

// Async Thunks
export const fetchWishlist = createAsyncThunk("wishlist/fetch", async (params, { rejectWithValue }) => {
  try {
    const res = await wishlistApi.getWishlist(params);
    return res.data.data; // { cakes: [...], pagination: {...} }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch wishlist");
  }
});

export const addToWishlistAsync = createAsyncThunk("wishlist/add", async (productId, { rejectWithValue }) => {
  try {
    const res = await wishlistApi.addToWishlist(productId);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to add to wishlist");
  }
});

export const removeFromWishlistAsync = createAsyncThunk("wishlist/remove", async (productId, { rejectWithValue }) => {
  try {
    const res = await wishlistApi.removeFromWishlist(productId);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to remove from wishlist");
  }
});

export const clearWishlistAsync = createAsyncThunk("wishlist/clear", async (_, { rejectWithValue }) => {
  try {
    const res = await wishlistApi.clearWishlist();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to clear wishlist");
  }
});

const initialState = {
  wishlistItems: [],
  wishlistCount: 0,
  pagination: null,
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // Synchronous action to reset state on user logout
    resetWishlistState(state) {
      state.wishlistItems = [];
      state.wishlistCount = 0;
      state.pagination = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, pending)
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlistItems = action.payload?.cakes || [];
        state.wishlistCount = action.payload?.pagination?.total || 0;
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchWishlist.rejected, rejected)

      // Add to Wishlist
      .addCase(addToWishlistAsync.pending, pending)
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlistItems = action.payload?.cakes || [];
        state.wishlistCount = action.payload?.pagination?.total || 0;
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(addToWishlistAsync.rejected, rejected)

      // Remove from Wishlist
      .addCase(removeFromWishlistAsync.pending, pending)
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlistItems = action.payload?.cakes || [];
        state.wishlistCount = action.payload?.pagination?.total || 0;
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(removeFromWishlistAsync.rejected, rejected)

      // Clear Wishlist
      .addCase(clearWishlistAsync.pending, pending)
      .addCase(clearWishlistAsync.fulfilled, (state) => {
        state.loading = false;
        state.wishlistItems = [];
        state.wishlistCount = 0;
        state.pagination = null;
      })
      .addCase(clearWishlistAsync.rejected, rejected);
  },
});

export const { resetWishlistState } = wishlistSlice.actions;

// ---- Selectors ----
export const selectWishlistItems = (state) => state.wishlist.wishlistItems;
export const selectWishlistCount = (state) => state.wishlist.wishlistCount;
export const selectIsInWishlist = (state, productId) =>
  state.wishlist.wishlistItems.some(
    (item) =>
      item._id === productId ||
      item.slug === productId ||
      item.id === productId ||
      item.cakeId === productId
  );

export default wishlistSlice.reducer;
