import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bannerApi } from "./bannerApi";

export const fetchHomeBanners = createAsyncThunk(
  "banners/fetchHomeBanners",
  async (_, { rejectWithValue }) => {
    try {
      const response = await bannerApi.getHomeBanners();
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load home banners");
    }
  }
);

export const fetchHomeHero = createAsyncThunk(
  "banners/fetchHomeHero",
  async (_, { rejectWithValue }) => {
    try {
      const response = await bannerApi.getHomeHero();
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load home hero");
    }
  }
);

const bannerSlice = createSlice({
  name: "banners",
  initialState: {
    homeBanners: [],
    heroData: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearBannerError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomeBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.homeBanners = action.payload;
      })
      .addCase(fetchHomeBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchHomeHero.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomeHero.fulfilled, (state, action) => {
        state.loading = false;
        state.heroData = action.payload;
      })
      .addCase(fetchHomeHero.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBannerError } = bannerSlice.actions;
export default bannerSlice.reducer;
