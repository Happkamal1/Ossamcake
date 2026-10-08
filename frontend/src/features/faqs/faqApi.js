import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export const faqApi = {
  getPublicFaqs: () => axios.get(`${API_BASE_URL}/faqs`, { withCredentials: true }),
};
