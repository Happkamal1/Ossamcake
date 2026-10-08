import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { testimonialApi } from "./testimonialApi";

export const fetchPublicTestimonials = createAsyncThunk(
  "testimonials/fetchPublicTestimonials",
  async (_, { rejectWithValue }) => {
    try {
      const response = await testimonialApi.getPublicTestimonials();
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load testimonials");
    }
  }
);

const testimonialSlice = createSlice({
  name: "testimonials",
  initialState: {
    testimonials: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearTestimonialError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicTestimonials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicTestimonials.fulfilled, (state, action) => {
        state.loading = false;
        state.testimonials = action.payload || [];
      })
      .addCase(fetchPublicTestimonials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTestimonialError } = testimonialSlice.actions;
export default testimonialSlice.reducer;
