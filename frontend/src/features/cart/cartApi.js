import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/v1/cart",
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
