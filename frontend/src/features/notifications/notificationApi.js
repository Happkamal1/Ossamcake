import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/v1/notifications",
  withCredentials: true,
});

const ADMIN_API = axios.create({
  baseURL: "http://localhost:5000/api/v1/admin/notifications",
  withCredentials: true,
});

// ── User-facing ───────────────────────────────────────────────────────────────
export const notificationApi = {
  getMyNotifications: (params = {}) => API.get("/", { params }),
  getUnreadCount:     ()             => API.get("/unread-count"),
  markAsRead:         (id)           => API.patch(`/${id}/read`),
  markAllAsRead:      ()             => API.patch("/read-all"),
  deleteNotification: (id)           => API.delete(`/${id}`),
};

// ── Admin-facing ──────────────────────────────────────────────────────────────
export const adminNotificationApi = {
  getAll:     (params = {}) => ADMIN_API.get("/", { params }),
  getById:    (id)           => ADMIN_API.get(`/${id}`),
  create:     (data)         => ADMIN_API.post("/", data),
  update:     (id, data)     => ADMIN_API.patch(`/${id}`, data),
  delete:     (id)           => ADMIN_API.delete(`/${id}`),
  send:       (id)           => ADMIN_API.post(`/${id}/send`),
  duplicate:  (id)           => ADMIN_API.post(`/${id}/duplicate`),
};
