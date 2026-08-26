import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

const API = axios.create({
  baseURL: `${API_BASE_URL}/wishlist`,
  withCredentials: true,
});

export const wishlistApi = {
  getWishlist: (params = {}) => API.get("/", { params }),
  addToWishlist: (productId) => API.post("/", { productId }),
  removeFromWishlist: (productId) => API.delete(`/${productId}`),
  clearWishlist: () => API.delete("/"),
};
