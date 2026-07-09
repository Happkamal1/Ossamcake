import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  dashboardApi, productsApi, categoriesApi, occasionsApi, cakeTypesApi,
  ordersApi, usersAdminApi, reviewsApi, couponsApi, bannersApi
} from './adminApi';

// ─── Dashboard Thunks ────────────────────────────────────────────────────────
export const fetchDashboardStats = createAsyncThunk('admin/fetchDashboardStats', async (_, { rejectWithValue }) => {
  try {
    const [stats, revenue, topProducts, recentOrders] = await Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getRevenueChart(),
      dashboardApi.getTopProducts(),
      dashboardApi.getRecentOrders(8),
    ]);
    return {
      stats: stats.data.data,
      revenue: revenue.data.data,
      topProducts: topProducts.data.data,
      recentOrders: recentOrders.data.data,
    };
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load dashboard'); }
});

// ─── Products Thunks ─────────────────────────────────────────────────────────
export const fetchAdminProducts = createAsyncThunk('admin/fetchProducts', async (params, { rejectWithValue }) => {
  try { const res = await productsApi.getAll(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch products'); }
});

export const createProduct = createAsyncThunk('admin/createProduct', async (data, { rejectWithValue }) => {
  try { const res = await productsApi.create(data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to create product'); }
});

export const updateProduct = createAsyncThunk('admin/updateProduct', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await productsApi.update(id, data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to update product'); }
});

export const deleteProduct = createAsyncThunk('admin/deleteProduct', async (id, { rejectWithValue }) => {
  try { await productsApi.softDelete(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to delete product'); }
});

export const toggleProductFlag = createAsyncThunk('admin/toggleProductFlag', async ({ id, flag, value }, { rejectWithValue }) => {
  try { const res = await productsApi.toggleFlag(id, flag, value); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to toggle flag'); }
});

// ─── Orders Thunks ───────────────────────────────────────────────────────────
export const fetchAdminOrders = createAsyncThunk('admin/fetchOrders', async (params, { rejectWithValue }) => {
  try { const res = await ordersApi.getAll(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders'); }
});

export const updateOrderStatus = createAsyncThunk('admin/updateOrderStatus', async ({ id, status }, { rejectWithValue }) => {
  try { const res = await ordersApi.updateStatus(id, status); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to update status'); }
});

// ─── Users Thunks ────────────────────────────────────────────────────────────
export const fetchAdminUsers = createAsyncThunk('admin/fetchUsers', async (params, { rejectWithValue }) => {
  try { const res = await usersAdminApi.getAll(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch users'); }
});

export const updateUserStatus = createAsyncThunk('admin/updateUserStatus', async ({ id, accountStatus }, { rejectWithValue }) => {
  try { const res = await usersAdminApi.updateStatus(id, accountStatus); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to update user status'); }
});

export const updateUserRole = createAsyncThunk('admin/updateUserRole', async ({ id, role }, { rejectWithValue }) => {
  try { const res = await usersAdminApi.updateRole(id, role); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to update user role'); }
});

// ─── Categories Thunks ───────────────────────────────────────────────────────
export const fetchAdminCategories = createAsyncThunk('admin/fetchCategories', async (params, { rejectWithValue }) => {
  try { const res = await categoriesApi.getAll(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories'); }
});
export const createCategory = createAsyncThunk('admin/createCategory', async (data, { rejectWithValue }) => {
  try { const res = await categoriesApi.create(data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to create category'); }
});
export const updateCategory = createAsyncThunk('admin/updateCategory', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await categoriesApi.update(id, data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to update category'); }
});
export const deleteCategory = createAsyncThunk('admin/deleteCategory', async (id, { rejectWithValue }) => {
  try { await categoriesApi.delete(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to delete category'); }
});

// ─── Occasions Thunks ────────────────────────────────────────────────────────
export const fetchAdminOccasions = createAsyncThunk('admin/fetchOccasions', async (params, { rejectWithValue }) => {
  try { const res = await occasionsApi.getAll(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const createOccasion = createAsyncThunk('admin/createOccasion', async (data, { rejectWithValue }) => {
  try { const res = await occasionsApi.create(data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const updateOccasion = createAsyncThunk('admin/updateOccasion', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await occasionsApi.update(id, data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const deleteOccasion = createAsyncThunk('admin/deleteOccasion', async (id, { rejectWithValue }) => {
  try { await occasionsApi.delete(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

// ─── CakeTypes Thunks ────────────────────────────────────────────────────────
export const fetchAdminCakeTypes = createAsyncThunk('admin/fetchCakeTypes', async (params, { rejectWithValue }) => {
  try { const res = await cakeTypesApi.getAll(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const createCakeType = createAsyncThunk('admin/createCakeType', async (data, { rejectWithValue }) => {
  try { const res = await cakeTypesApi.create(data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const updateCakeType = createAsyncThunk('admin/updateCakeType', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await cakeTypesApi.update(id, data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const deleteCakeType = createAsyncThunk('admin/deleteCakeType', async (id, { rejectWithValue }) => {
  try { await cakeTypesApi.delete(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

// ─── Reviews Thunks ──────────────────────────────────────────────────────────
export const fetchAdminReviews = createAsyncThunk('admin/fetchReviews', async (params, { rejectWithValue }) => {
  try { const res = await reviewsApi.getAll(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const approveReview = createAsyncThunk('admin/approveReview', async (id, { rejectWithValue }) => {
  try { const res = await reviewsApi.approve(id); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const deleteReview = createAsyncThunk('admin/deleteReview', async (id, { rejectWithValue }) => {
  try { await reviewsApi.delete(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

// ─── Coupons Thunks ──────────────────────────────────────────────────────────
export const fetchAdminCoupons = createAsyncThunk('admin/fetchCoupons', async (params, { rejectWithValue }) => {
  try { const res = await couponsApi.getAll(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const createCoupon = createAsyncThunk('admin/createCoupon', async (data, { rejectWithValue }) => {
  try { const res = await couponsApi.create(data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const updateCoupon = createAsyncThunk('admin/updateCoupon', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await couponsApi.update(id, data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const deleteCoupon = createAsyncThunk('admin/deleteCoupon', async (id, { rejectWithValue }) => {
  try { await couponsApi.delete(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

// ─── Banners Thunks ──────────────────────────────────────────────────────────
export const fetchAdminBanners = createAsyncThunk('admin/fetchBanners', async (params, { rejectWithValue }) => {
  try { const res = await bannersApi.getAll(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const createBanner = createAsyncThunk('admin/createBanner', async (data, { rejectWithValue }) => {
  try { const res = await bannersApi.create(data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const updateBanner = createAsyncThunk('admin/updateBanner', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await bannersApi.update(id, data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const deleteBanner = createAsyncThunk('admin/deleteBanner', async (id, { rejectWithValue }) => {
  try { await bannersApi.delete(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

// ─── Slice ───────────────────────────────────────────────────────────────────
const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    // Dashboard
    stats: null, revenue: [], topProducts: [], recentOrders: [],
    // Products
    products: [], productsPagination: null,
    // Orders
    orders: [], ordersPagination: null,
    // Users
    users: [], usersPagination: null,
    // Categories / Occasions / CakeTypes
    categories: [], occasions: [], cakeTypes: [],
    // Reviews
    reviews: [], reviewsPagination: null,
    // Coupons
    coupons: [], couponsPagination: null,
    // Banners
    banners: [], bannersPagination: null,
    // Global
    loading: false, error: null,
  },
  reducers: {
    clearAdminError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      // Dashboard
      .addCase(fetchDashboardStats.pending, pending)
      .addCase(fetchDashboardStats.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.stats = payload.stats;
        state.revenue = payload.revenue;
        state.topProducts = payload.topProducts;
        state.recentOrders = payload.recentOrders;
      })
      .addCase(fetchDashboardStats.rejected, rejected)

      // Products
      .addCase(fetchAdminProducts.pending, pending)
      .addCase(fetchAdminProducts.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.products = payload.products || payload;
        state.productsPagination = payload.pagination || null;
      })
      .addCase(fetchAdminProducts.rejected, rejected)
      .addCase(createProduct.fulfilled, (state, { payload }) => { state.products.unshift(payload); })
      .addCase(updateProduct.fulfilled, (state, { payload }) => {
        const i = state.products.findIndex(p => p._id === payload._id);
        if (i !== -1) state.products[i] = payload;
      })
      .addCase(deleteProduct.fulfilled, (state, { payload }) => {
        state.products = state.products.filter(p => p._id !== payload);
      })
      .addCase(toggleProductFlag.fulfilled, (state, { payload }) => {
        const i = state.products.findIndex(p => p._id === payload._id);
        if (i !== -1) state.products[i] = payload;
      })

      // Orders
      .addCase(fetchAdminOrders.pending, pending)
      .addCase(fetchAdminOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.orders = payload.orders || payload;
        state.ordersPagination = payload.pagination || null;
      })
      .addCase(fetchAdminOrders.rejected, rejected)
      .addCase(updateOrderStatus.fulfilled, (state, { payload }) => {
        const i = state.orders.findIndex(o => o._id === payload._id);
        if (i !== -1) state.orders[i] = payload;
      })

      // Users
      .addCase(fetchAdminUsers.pending, pending)
      .addCase(fetchAdminUsers.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.users = payload.users || payload;
        state.usersPagination = payload.pagination || null;
      })
      .addCase(fetchAdminUsers.rejected, rejected)
      .addCase(updateUserStatus.fulfilled, (state, { payload }) => {
        const i = state.users.findIndex(u => u._id === payload._id);
        if (i !== -1) state.users[i] = payload;
      })
      .addCase(updateUserRole.fulfilled, (state, { payload }) => {
        const i = state.users.findIndex(u => u._id === payload._id);
        if (i !== -1) state.users[i] = payload;
      })

      // Categories
      .addCase(fetchAdminCategories.pending, pending)
      .addCase(fetchAdminCategories.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.categories = payload.categories || payload;
      })
      .addCase(fetchAdminCategories.rejected, rejected)
      .addCase(createCategory.fulfilled, (state, { payload }) => { state.categories.unshift(payload); })
      .addCase(updateCategory.fulfilled, (state, { payload }) => {
        const i = state.categories.findIndex(c => c._id === payload._id);
        if (i !== -1) state.categories[i] = payload;
      })
      .addCase(deleteCategory.fulfilled, (state, { payload }) => {
        state.categories = state.categories.filter(c => c._id !== payload);
      })

      // Occasions
      .addCase(fetchAdminOccasions.pending, pending)
      .addCase(fetchAdminOccasions.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.occasions = payload.occasions || payload;
      })
      .addCase(fetchAdminOccasions.rejected, rejected)
      .addCase(createOccasion.fulfilled, (state, { payload }) => { state.occasions.unshift(payload); })
      .addCase(updateOccasion.fulfilled, (state, { payload }) => {
        const i = state.occasions.findIndex(o => o._id === payload._id);
        if (i !== -1) state.occasions[i] = payload;
      })
      .addCase(deleteOccasion.fulfilled, (state, { payload }) => {
        state.occasions = state.occasions.filter(o => o._id !== payload);
      })

      // CakeTypes
      .addCase(fetchAdminCakeTypes.pending, pending)
      .addCase(fetchAdminCakeTypes.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.cakeTypes = payload.cakeTypes || payload;
      })
      .addCase(fetchAdminCakeTypes.rejected, rejected)
      .addCase(createCakeType.fulfilled, (state, { payload }) => { state.cakeTypes.unshift(payload); })
      .addCase(updateCakeType.fulfilled, (state, { payload }) => {
        const i = state.cakeTypes.findIndex(t => t._id === payload._id);
        if (i !== -1) state.cakeTypes[i] = payload;
      })
      .addCase(deleteCakeType.fulfilled, (state, { payload }) => {
        state.cakeTypes = state.cakeTypes.filter(t => t._id !== payload);
      })

      // Reviews
      .addCase(fetchAdminReviews.pending, pending)
      .addCase(fetchAdminReviews.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.reviews = payload.reviews || payload;
        state.reviewsPagination = payload.pagination || null;
      })
      .addCase(fetchAdminReviews.rejected, rejected)
      .addCase(approveReview.fulfilled, (state, { payload }) => {
        const i = state.reviews.findIndex(r => r._id === payload._id);
        if (i !== -1) state.reviews[i] = payload;
      })
      .addCase(deleteReview.fulfilled, (state, { payload }) => {
        state.reviews = state.reviews.filter(r => r._id !== payload);
      })

      // Coupons
      .addCase(fetchAdminCoupons.pending, pending)
      .addCase(fetchAdminCoupons.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.coupons = payload.coupons || payload;
        state.couponsPagination = payload.pagination || null;
      })
      .addCase(fetchAdminCoupons.rejected, rejected)
      .addCase(createCoupon.fulfilled, (state, { payload }) => { state.coupons.unshift(payload); })
      .addCase(updateCoupon.fulfilled, (state, { payload }) => {
        const i = state.coupons.findIndex(c => c._id === payload._id);
        if (i !== -1) state.coupons[i] = payload;
      })
      .addCase(deleteCoupon.fulfilled, (state, { payload }) => {
        state.coupons = state.coupons.filter(c => c._id !== payload);
      })

      // Banners
      .addCase(fetchAdminBanners.pending, pending)
      .addCase(fetchAdminBanners.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.banners = payload.banners || payload;
        state.bannersPagination = payload.pagination || null;
      })
      .addCase(fetchAdminBanners.rejected, rejected)
      .addCase(createBanner.fulfilled, (state, { payload }) => { state.banners.unshift(payload); })
      .addCase(updateBanner.fulfilled, (state, { payload }) => {
        const i = state.banners.findIndex(b => b._id === payload._id);
        if (i !== -1) state.banners[i] = payload;
      })
      .addCase(deleteBanner.fulfilled, (state, { payload }) => {
        state.banners = state.banners.filter(b => b._id !== payload);
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
