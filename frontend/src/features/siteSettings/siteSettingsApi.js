import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export const siteSettingsApi = {
  getPublicSettings: () => axios.get(`${API_BASE_URL}/settings`, { withCredentials: true }),
};
