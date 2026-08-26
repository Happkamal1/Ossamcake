import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

const BASE = `${API_BASE_URL}/banners`;

export const bannerApi = {
  getHomeBanners: () => axios.get(`${BASE}/home`, { withCredentials: true }),
  getActiveBanners: () => axios.get(BASE, { withCredentials: true }),
  getHomeHero: () => axios.get(`${API_BASE_URL}/home/hero`, { withCredentials: true }),
};
