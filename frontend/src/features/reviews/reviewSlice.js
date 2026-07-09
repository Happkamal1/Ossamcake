import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { reviewApi } from "./reviewApi";

// Async Thunks
export const fetchReviews = createAsyncThunk("reviews/fetchAll", async ({ productId, page = 1, limit = 10 }, { rejectWithValue }) => {
  try {
    const res = await reviewApi.getReviews(productId, { page, limit });
    return res.data.data; // { reviews: [...], breakdown: {...}, pagination: {...} }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch reviews");
  }
});

export const createReview = createAsyncThunk("reviews/create", async ({ productId, reviewData }, { rejectWithValue }) => {
  try {
    const res = await reviewApi.createReview(productId, reviewData);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to submit review");
  }
});

export const updateReview = createAsyncThunk("reviews/update", async ({ reviewId, reviewData }, { rejectWithValue }) => {
  try {
    const res = await reviewApi.updateReview(reviewId, reviewData);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to update review");
  }
});

export const deleteReview = createAsyncThunk("reviews/delete", async (reviewId, { rejectWithValue }) => {
  try {
    await reviewApi.deleteReview(reviewId);
    return reviewId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to delete review");
  }
});

const initialState = {
  items: [],
  breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  pagination: null,
  loading: false,
  error: null,
};

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearReviewsState(state) {
      state.items = [];
      state.breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
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
      // Fetch Reviews
      .addCase(fetchReviews.pending, pending)
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.reviews || [];
        state.breakdown = action.payload?.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchReviews.rejected, rejected)

      // Create Review
      .addCase(createReview.pending, pending)
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        // Increment the count for that rating in the breakdown
        const rating = action.payload.rating;
        if (state.breakdown[rating] !== undefined) {
          state.breakdown[rating] += 1;
        }
      })
      .addCase(createReview.rejected, rejected)

      // Update Review
      .addCase(updateReview.pending, pending)
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index > -1) {
          // Adjust breakdown count if rating changed
          const oldRating = state.items[index].rating;
          const newRating = action.payload.rating;
          if (oldRating !== newRating) {
            if (state.breakdown[oldRating] > 0) state.breakdown[oldRating] -= 1;
            state.breakdown[newRating] += 1;
          }
          state.items[index] = action.payload;
        }
      })
      .addCase(updateReview.rejected, rejected)

      // Delete Review
      .addCase(deleteReview.pending, pending)
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        const removedItem = state.items.find((item) => item._id === action.payload);
        if (removedItem) {
          const rating = removedItem.rating;
          if (state.breakdown[rating] > 0) {
            state.breakdown[rating] -= 1;
          }
        }
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteReview.rejected, rejected);
  },
});

export const { clearReviewsState } = reviewSlice.actions;

// ---- Selectors ----
export const selectReviews = (state) => state.reviews.items;
export const selectReviewsBreakdown = (state) => state.reviews.breakdown;
export const selectReviewsPagination = (state) => state.reviews.pagination;
export const selectReviewsLoading = (state) => state.reviews.loading;

export default reviewSlice.reducer;
