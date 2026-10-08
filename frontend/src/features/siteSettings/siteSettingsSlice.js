import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { siteSettingsApi } from "./siteSettingsApi";

const DEFAULT_SETTINGS = {
  businessName: "OssamCake",
  tagline: "Crafting Luxury Celebrations with Sweet Elegance",
  phone: "+1 (555) 123-4567",
  email: "hello@ossamcake.com",
  address: "123 Baker Street, Manhattan, New York, NY 10001",
  workingHours: "Mon - Sun: 8:00 AM - 10:00 PM",
  socialLinks: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    twitter: "https://twitter.com",
    pinterest: "",
  },
  footer: {
    aboutText: "Crafting premium luxury celebrations with sweet elegance since 2010. Every cake is hand-finished by master pastry artists.",
    copyrightText: "OssamCake. All rights reserved.",
  },
  shipping: {
    freeShippingThreshold: 800.0,
    shippingFee: 99.0,
    taxRate: 0.05,
    currencySymbol: "₹",
    currencyCode: "INR",
  },
  announcement: {
    enabled: true,
    text: "Free delivery on orders over ₹800! Use code WELCOME10 for 10% off",
    link: "/offers",
  },
};

export const fetchPublicSettings = createAsyncThunk(
  "siteSettings/fetchPublicSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await siteSettingsApi.getPublicSettings();
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load site settings");
    }
  }
);

const siteSettingsSlice = createSlice({
  name: "siteSettings",
  initialState: {
    settings: DEFAULT_SETTINGS,
    loading: false,
    error: null,
    loaded: false,
  },
  reducers: {
    updateLocalSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.settings = {
          ...DEFAULT_SETTINGS,
          ...action.payload,
          socialLinks: { ...DEFAULT_SETTINGS.socialLinks, ...(action.payload?.socialLinks || {}) },
          footer: { ...DEFAULT_SETTINGS.footer, ...(action.payload?.footer || {}) },
          shipping: { ...DEFAULT_SETTINGS.shipping, ...(action.payload?.shipping || {}) },
          announcement: { ...DEFAULT_SETTINGS.announcement, ...(action.payload?.announcement || {}) },
        };
      })
      .addCase(fetchPublicSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Keep DEFAULT_SETTINGS on error so nothing breaks visually
      });
  },
});

export const { updateLocalSettings } = siteSettingsSlice.actions;
export default siteSettingsSlice.reducer;
