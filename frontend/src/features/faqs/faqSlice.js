import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { faqApi } from "./faqApi";

export const fetchPublicFaqs = createAsyncThunk(
  "faqs/fetchPublicFaqs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await faqApi.getPublicFaqs();
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load FAQs");
    }
  }
);

const faqSlice = createSlice({
  name: "faqs",
  initialState: {
    faqs: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearFaqError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicFaqs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicFaqs.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs = action.payload || [];
      })
      .addCase(fetchPublicFaqs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFaqError } = faqSlice.actions;
export default faqSlice.reducer;
