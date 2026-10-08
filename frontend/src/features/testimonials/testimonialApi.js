import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export const testimonialApi = {
  getPublicTestimonials: () => axios.get(`${API_BASE_URL}/testimonials`, { withCredentials: true }),
};
