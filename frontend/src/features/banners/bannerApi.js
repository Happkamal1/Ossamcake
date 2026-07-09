import axios from "axios";

const BASE = "http://localhost:5000/api/v1/banners";

export const bannerApi = {
  getHomeBanners: () => axios.get(`${BASE}/home`, { withCredentials: true }),
  getActiveBanners: () => axios.get(BASE, { withCredentials: true }),
  getHomeHero: () => axios.get("http://localhost:5000/api/v1/home/hero", { withCredentials: true }),
};
