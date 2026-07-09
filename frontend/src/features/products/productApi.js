import axios from 'axios';

const BASE = 'http://localhost:5000/api/v1';

const API = axios.create({
  baseURL: `${BASE}/products`,
  withCredentials: true,
});

// Separate instance for master-data endpoints (categories, occasions, cake-types)
const META_API = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

export const productApi = {
  getAll: (params = {}) => API.get('/', { params }),
  getById: (id) => API.get(`/${id}`),
  getBySlug: (slug) => API.get(`/slug/${slug}`),
  getBestSellers: () => API.get('/best-sellers'),
  getTodaySpecials: () => API.get('/today-specials'),
  getTrending: (limit) => API.get('/trending', { params: { limit } }),
  getFeatured: (limit) => API.get('/featured', { params: { limit } }),
  getNewArrivals: (limit) => API.get('/new-arrivals', { params: { limit } }),
  getRecommended: (limit) => API.get('/recommended', { params: { limit } }),
  getRelated: (id, limit) => API.get(`/related/${id}`, { params: { limit } }),
  search: (q, limit) => API.get('/search', { params: { q, limit } }),
};

// Master-data public APIs (no auth required)
export const metaApi = {
  getCategories: () => META_API.get('/categories'),
  getOccasions: () => META_API.get('/occasions'),
  getCakeTypes: () => META_API.get('/cake-types'),
};

