import axios from 'axios';

const ADMIN_API = axios.create({
  baseURL: 'http://localhost:5000/api/v1/admin',
  withCredentials: true,
});

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => ADMIN_API.get('/dashboard/stats'),
  getRecentOrders: (limit = 10) => ADMIN_API.get(`/dashboard/recent-orders?limit=${limit}`),
  getRevenueChart: (year) => ADMIN_API.get(`/dashboard/revenue-chart${year ? `?year=${year}` : ''}`),
  getTopProducts: (limit = 5) => ADMIN_API.get(`/dashboard/top-products?limit=${limit}`),
};

// ─── Products ────────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: (params = {}) => ADMIN_API.get('/products', { params }),
  getById: (id) => ADMIN_API.get(`/products/${id}`),
  create: (data) => ADMIN_API.post('/products', data),
  update: (id, data) => ADMIN_API.put(`/products/${id}`, data),
  toggleFlag: (id, flag, value) => ADMIN_API.patch(`/products/${id}/toggle-flag`, { flag, value }),
  softDelete: (id) => ADMIN_API.delete(`/products/${id}`),
  hardDelete: (id) => ADMIN_API.delete(`/products/${id}/permanent`),
};

// ─── Categories ──────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: (params = {}) => ADMIN_API.get('/categories', { params }),
  getById: (id) => ADMIN_API.get(`/categories/${id}`),
  create: (data) => ADMIN_API.post('/categories', data),
  update: (id, data) => ADMIN_API.put(`/categories/${id}`, data),
  delete: (id) => ADMIN_API.delete(`/categories/${id}`),
};

// ─── Occasions ───────────────────────────────────────────────────────────────
export const occasionsApi = {
  getAll: (params = {}) => ADMIN_API.get('/occasions', { params }),
  getById: (id) => ADMIN_API.get(`/occasions/${id}`),
  create: (data) => ADMIN_API.post('/occasions', data),
  update: (id, data) => ADMIN_API.put(`/occasions/${id}`, data),
  delete: (id) => ADMIN_API.delete(`/occasions/${id}`),
};

// ─── Cake Types ──────────────────────────────────────────────────────────────
export const cakeTypesApi = {
  getAll: (params = {}) => ADMIN_API.get('/cake-types', { params }),
  getById: (id) => ADMIN_API.get(`/cake-types/${id}`),
  create: (data) => ADMIN_API.post('/cake-types', data),
  update: (id, data) => ADMIN_API.put(`/cake-types/${id}`, data),
  delete: (id) => ADMIN_API.delete(`/cake-types/${id}`),
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const ordersApi = {
  getAll: (params = {}) => ADMIN_API.get('/orders', { params }),
  getById: (id) => ADMIN_API.get(`/orders/${id}`),
  getStats: (params = {}) => ADMIN_API.get('/orders/stats', { params }),
  updateStatus: (id, status) => ADMIN_API.patch(`/orders/${id}/status`, { status }),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersAdminApi = {
  getAll: (params = {}) => ADMIN_API.get('/users', { params }),
  getById: (id) => ADMIN_API.get(`/users/${id}`),
  updateStatus: (id, accountStatus) => ADMIN_API.patch(`/users/${id}/status`, { accountStatus }),
  updateRole: (id, role) => ADMIN_API.patch(`/users/${id}/role`, { role }),
};

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const reviewsApi = {
  getAll: (params = {}) => ADMIN_API.get('/reviews', { params }),
  approve: (id) => ADMIN_API.patch(`/reviews/${id}/approve`),
  delete: (id) => ADMIN_API.delete(`/reviews/${id}`),
};

// ─── Coupons ─────────────────────────────────────────────────────────────────
export const couponsApi = {
  getAll: (params = {}) => ADMIN_API.get('/coupons', { params }),
  getById: (id) => ADMIN_API.get(`/coupons/${id}`),
  create: (data) => ADMIN_API.post('/coupons', data),
  update: (id, data) => ADMIN_API.put(`/coupons/${id}`, data),
  delete: (id) => ADMIN_API.delete(`/coupons/${id}`),
};

// ─── Banners ─────────────────────────────────────────────────────────────────
export const bannersApi = {
  getAll: (params = {}) => ADMIN_API.get('/banners', { params }),
  create: (data) => ADMIN_API.post('/banners', data),
  update: (id, data) => ADMIN_API.put(`/banners/${id}`, data),
  delete: (id) => ADMIN_API.delete(`/banners/${id}`),
  uploadImage: (formData) => ADMIN_API.post('/banners/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteImage: (publicId) => ADMIN_API.delete(`/banners/image/${encodeURIComponent(publicId)}`),
};
