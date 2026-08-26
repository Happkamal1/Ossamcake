import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const reviewApi = {
  getReviews: (productId, params = {}) => API.get(`/products/${productId}/reviews`, { params }),
  createReview: (productId, reviewData) => API.post(`/products/${productId}/reviews`, reviewData),
  updateReview: (reviewId, reviewData) => API.patch(`/reviews/${reviewId}`, reviewData),
  deleteReview: (reviewId) => API.delete(`/reviews/${reviewId}`),
};
