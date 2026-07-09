import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productApi, metaApi } from './productApi';

// Thunks
export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await productApi.getAll(params);
    return res.data.data; // { cakes, pagination }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
  }
});

export const fetchProductBySlug = createAsyncThunk('products/fetchBySlug', async (slug, { rejectWithValue }) => {
  try {
    const res = await productApi.getBySlug(slug);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch product details');
  }
});

export const fetchProductById = createAsyncThunk('products/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await productApi.getById(id);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch product details');
  }
});

export const fetchBestSellers = createAsyncThunk('products/fetchBestSellers', async (_, { rejectWithValue }) => {
  try {
    const res = await productApi.getBestSellers();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch best sellers');
  }
});

export const fetchTodaySpecials = createAsyncThunk('products/fetchTodaySpecials', async (_, { rejectWithValue }) => {
  try {
    const res = await productApi.getTodaySpecials();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch today\'s specials');
  }
});

export const fetchTrendingProducts = createAsyncThunk('products/fetchTrending', async (limit, { rejectWithValue }) => {
  try {
    const res = await productApi.getTrending(limit);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch trending cakes');
  }
});

export const fetchFeaturedProducts = createAsyncThunk('products/fetchFeatured', async (limit, { rejectWithValue }) => {
  try {
    const res = await productApi.getFeatured(limit);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch featured cakes');
  }
});

export const fetchNewArrivalProducts = createAsyncThunk('products/fetchNewArrivals', async (limit, { rejectWithValue }) => {
  try {
    const res = await productApi.getNewArrivals(limit);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch new arrival cakes');
  }
});

export const fetchRecommendedProducts = createAsyncThunk('products/fetchRecommended', async (limit, { rejectWithValue }) => {
  try {
    const res = await productApi.getRecommended(limit);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch recommended cakes');
  }
});

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const res = await metaApi.getCategories();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
  }
});

export const fetchOccasions = createAsyncThunk('products/fetchOccasions', async (_, { rejectWithValue }) => {
  try {
    const res = await metaApi.getOccasions();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch occasions');
  }
});

export const fetchCakeTypes = createAsyncThunk('products/fetchCakeTypes', async (_, { rejectWithValue }) => {
  try {
    const res = await metaApi.getCakeTypes();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch cake types');
  }
});

const initialState = {
  items: [],
  bestSellers: [],
  todaySpecials: [],
  trending: [],
  featured: [],
  newArrivals: [],
  recommended: [],
  categories: [],
  occasions: [],
  cakeTypes: [],
  selectedProduct: null,
  pagination: null,
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    clearProductError: (state) => {
      state.error = null;
    }
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
      // Fetch All
      .addCase(fetchProducts.pending, pending)
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cakes || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchProducts.rejected, rejected)

      // Fetch By Slug
      .addCase(fetchProductBySlug.pending, pending)
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, rejected)

      // Fetch By ID
      .addCase(fetchProductById.pending, pending)
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, rejected)

      // Best Sellers
      .addCase(fetchBestSellers.pending, pending)
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.loading = false;
        state.bestSellers = action.payload || [];
      })
      .addCase(fetchBestSellers.rejected, rejected)

      // Today's Specials
      .addCase(fetchTodaySpecials.pending, pending)
      .addCase(fetchTodaySpecials.fulfilled, (state, action) => {
        state.loading = false;
        state.todaySpecials = action.payload || [];
      })
      .addCase(fetchTodaySpecials.rejected, rejected)

      // Trending
      .addCase(fetchTrendingProducts.pending, pending)
      .addCase(fetchTrendingProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.trending = action.payload || [];
      })
      .addCase(fetchTrendingProducts.rejected, rejected)

      // Featured
      .addCase(fetchFeaturedProducts.pending, pending)
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featured = action.payload || [];
      })
      .addCase(fetchFeaturedProducts.rejected, rejected)

      // New Arrivals
      .addCase(fetchNewArrivalProducts.pending, pending)
      .addCase(fetchNewArrivalProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.newArrivals = action.payload || [];
      })
      .addCase(fetchNewArrivalProducts.rejected, rejected)

      // Recommended
      .addCase(fetchRecommendedProducts.pending, pending)
      .addCase(fetchRecommendedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.recommended = action.payload || [];
      })
      .addCase(fetchRecommendedProducts.rejected, rejected)

      // Categories
      .addCase(fetchCategories.pending, (state) => { state.loading = true; })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload || [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Occasions
      .addCase(fetchOccasions.pending, (state) => { state.loading = true; })
      .addCase(fetchOccasions.fulfilled, (state, action) => {
        state.loading = false;
        state.occasions = action.payload || [];
      })
      .addCase(fetchOccasions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cake Types
      .addCase(fetchCakeTypes.pending, (state) => { state.loading = true; })
      .addCase(fetchCakeTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.cakeTypes = action.payload || [];
      })
      .addCase(fetchCakeTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedProduct, clearProductError } = productSlice.actions;
export default productSlice.reducer;
