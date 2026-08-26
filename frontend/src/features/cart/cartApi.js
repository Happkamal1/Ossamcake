import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

const API = axios.create({
  baseURL: `${API_BASE_URL}/cart`,
  withCredentials: true,
});

export const cartApi = {
  getCart: () => API.get("/"),
  addToCart: (itemData) => API.post("/add", itemData),
  updateQuantity: (itemId, quantity) => API.put(`/${itemId}`, { quantity }),
  removeFromCart: (itemId) => API.delete(`/${itemId}`),
  clearCart: () => API.delete("/"),
  applyCoupon: (code, subtotal) => API.post("/coupon", { code, subtotal }),
};
