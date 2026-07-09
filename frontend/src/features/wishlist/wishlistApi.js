import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/v1/wishlist",
  withCredentials: true,
});

export const wishlistApi = {
  getWishlist: (params = {}) => API.get("/", { params }),
  addToWishlist: (productId) => API.post("/", { productId }),
  removeFromWishlist: (productId) => API.delete(`/${productId}`),
  clearWishlist: () => API.delete("/"),
};
