import axios from "axios";

const BASE = "http://localhost:5000/api/v1";

const API = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

export const reviewApi = {
  getReviews: (productId, params = {}) => API.get(`/products/${productId}/reviews`, { params }),
  createReview: (productId, reviewData) => API.post(`/products/${productId}/reviews`, reviewData),
  updateReview: (reviewId, reviewData) => API.patch(`/reviews/${reviewId}`, reviewData),
  deleteReview: (reviewId) => API.delete(`/reviews/${reviewId}`),
};
