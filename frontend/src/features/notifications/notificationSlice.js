import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationApi, adminNotificationApi } from "./notificationApi";

// ── User Thunks ────────────────────────────────────────────────────────────────
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchMy",
  async ({ page = 1, reset = false } = {}, { rejectWithValue }) => {
    try {
      const res = await notificationApi.getMyNotifications({ page, limit: 15 });
      return { ...res.data.data, reset };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch notifications");
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/unreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationApi.getUnreadCount();
      return res.data.data.count;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch unread count");
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markRead",
  async (id, { rejectWithValue }) => {
    try {
      await notificationApi.markAsRead(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to mark as read");
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to mark all as read");
    }
  }
);

export const deleteMyNotification = createAsyncThunk(
  "notifications/deleteMy",
  async (id, { rejectWithValue }) => {
    try {
      await notificationApi.deleteNotification(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete notification");
    }
  }
);

export const fetchNotificationById = createAsyncThunk(
  "notifications/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await notificationApi.getById(id);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Notification not found");
    }
  }
);

export const fetchNotificationBySlug = createAsyncThunk(
  "notifications/fetchBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const res = await notificationApi.getBySlug(slug);
      return res.data.data; // { ...userNotif, notification: { ...notif, relatedProduct, relatedOrder } }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Notification not found");
    }
  }
);

// ── Admin Thunks ──────────────────────────────────────────────────────────────
export const fetchAdminNotifications = createAsyncThunk(
  "notifications/fetchAdmin",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await adminNotificationApi.getAll(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch notifications");
    }
  }
);

export const createAdminNotification = createAsyncThunk(
  "notifications/createAdmin",
  async (data, { rejectWithValue }) => {
    try {
      const res = await adminNotificationApi.create(data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create notification");
    }
  }
);

export const updateAdminNotification = createAsyncThunk(
  "notifications/updateAdmin",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await adminNotificationApi.update(id, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update notification");
    }
  }
);

export const deleteAdminNotification = createAsyncThunk(
  "notifications/deleteAdmin",
  async (id, { rejectWithValue }) => {
    try {
      await adminNotificationApi.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete notification");
    }
  }
);

export const sendAdminNotification = createAsyncThunk(
  "notifications/sendAdmin",
  async (id, { rejectWithValue }) => {
    try {
      const res = await adminNotificationApi.send(id);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to send notification");
    }
  }
);

export const duplicateAdminNotification = createAsyncThunk(
  "notifications/duplicateAdmin",
  async (id, { rejectWithValue }) => {
    try {
      const res = await adminNotificationApi.duplicate(id);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to duplicate notification");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    // User notifications
    notifications: [],
    unreadCount: 0,
    hasMore: true,
    page: 1,
    loading: false,
    error: null,
    activeNotification: null,

    // Single notification detail (for detail page)
    currentNotification: null,
    detailLoading: false,
    detailError: null,

    // Admin notifications
    adminNotifications: [],
    adminPagination: { total: 0, totalPages: 0, page: 1, limit: 15 },
    adminLoading: false,
    adminError: null,
    adminSubmitting: false,
  },
  reducers: {
    clearUserNotifications(state) {
      state.notifications = [];
      state.page = 1;
      state.hasMore = true;
    },
    clearCurrentNotification(state) {
      state.currentNotification = null;
      state.detailError = null;
    },
    resetAdminError(state) {
      state.adminError = null;
    },
    openNotificationModal(state, action) {
      state.activeNotification = action.payload;
    },
    closeNotificationModal(state) {
      state.activeNotification = null;
    },
  },
  extraReducers: (builder) => {
    // fetchNotifications
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
        state.loading = false;
        const { notifications, pagination, unreadCount, reset } = payload;
        state.notifications = reset
          ? notifications
          : [...state.notifications, ...notifications];
        state.unreadCount = unreadCount ?? state.unreadCount;
        state.hasMore = pagination.page < pagination.totalPages;
        state.page = pagination.page;
      })
      .addCase(fetchNotifications.rejected, (state, { payload }) => {
        state.loading = false; state.error = payload;
      });

    // fetchUnreadCount
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, { payload }) => { state.unreadCount = payload; });

    // markAsRead
    builder
      .addCase(markAsRead.fulfilled, (state, { payload: id }) => {
        const item = state.notifications.find((n) => n.notification?._id === id);
        if (item && !item.isRead) { item.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
      });

    // markAllAsRead
    builder
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => { n.isRead = true; });
        state.unreadCount = 0;
      });

    // deleteMyNotification
    builder
      .addCase(deleteMyNotification.fulfilled, (state, { payload: id }) => {
        const item = state.notifications.find((n) => n.notification?._id === id);
        if (item && !item.isRead) state.unreadCount = Math.max(0, state.unreadCount - 1);
        state.notifications = state.notifications.filter((n) => n.notification?._id !== id);
      });

    // fetchNotificationById (detail page — ObjectId, backward compat)
    builder
      .addCase(fetchNotificationById.pending, (state) => {
        state.detailLoading = true; state.detailError = null; state.currentNotification = null;
      })
      .addCase(fetchNotificationById.fulfilled, (state, { payload }) => {
        state.detailLoading = false;
        state.currentNotification = payload;
        // Sync read status in the list if the notification is present
        const item = state.notifications.find((n) => n.notification?._id === payload.notification?._id);
        if (item && !item.isRead) {
          item.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(fetchNotificationById.rejected, (state, { payload }) => {
        state.detailLoading = false; state.detailError = payload;
      });

    // fetchNotificationBySlug (detail page — SEO slug, primary)
    builder
      .addCase(fetchNotificationBySlug.pending, (state) => {
        state.detailLoading = true; state.detailError = null; state.currentNotification = null;
      })
      .addCase(fetchNotificationBySlug.fulfilled, (state, { payload }) => {
        state.detailLoading = false;
        state.currentNotification = payload;
        // Sync read status in the notification list
        const item = state.notifications.find((n) => n.notification?._id === payload.notification?._id);
        if (item && !item.isRead) { item.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
      })
      .addCase(fetchNotificationBySlug.rejected, (state, { payload }) => {
        state.detailLoading = false; state.detailError = payload;
      });

    // Admin: fetchAdminNotifications
    builder
      .addCase(fetchAdminNotifications.pending, (state) => { state.adminLoading = true; state.adminError = null; })
      .addCase(fetchAdminNotifications.fulfilled, (state, { payload }) => {
        state.adminLoading = false;
        state.adminNotifications = payload.notifications;
        state.adminPagination = payload.pagination;
      })
      .addCase(fetchAdminNotifications.rejected, (state, { payload }) => {
        state.adminLoading = false; state.adminError = payload;
      });

    // Admin: create
    builder
      .addCase(createAdminNotification.pending, (state) => { state.adminSubmitting = true; })
      .addCase(createAdminNotification.fulfilled, (state, { payload }) => {
        state.adminSubmitting = false;
        const notif = payload?.notification || payload;
        if (notif && notif._id) state.adminNotifications.unshift(notif);
      })
      .addCase(createAdminNotification.rejected, (state, { payload }) => {
        state.adminSubmitting = false; state.adminError = payload;
      });

    // Admin: update
    builder
      .addCase(updateAdminNotification.pending, (state) => { state.adminSubmitting = true; })
      .addCase(updateAdminNotification.fulfilled, (state, { payload }) => {
        state.adminSubmitting = false;
        const idx = state.adminNotifications.findIndex((n) => n._id === payload._id);
        if (idx !== -1) state.adminNotifications[idx] = payload;
      })
      .addCase(updateAdminNotification.rejected, (state, { payload }) => {
        state.adminSubmitting = false; state.adminError = payload;
      });

    // Admin: delete
    builder
      .addCase(deleteAdminNotification.fulfilled, (state, { payload: id }) => {
        state.adminNotifications = state.adminNotifications.filter((n) => n._id !== id);
      });

    // Admin: send
    builder
      .addCase(sendAdminNotification.pending, (state) => { state.adminSubmitting = true; })
      .addCase(sendAdminNotification.fulfilled, (state, { payload }) => {
        state.adminSubmitting = false;
        const notif = payload?.notification;
        if (notif) {
          const idx = state.adminNotifications.findIndex((n) => n._id === notif._id);
          if (idx !== -1) state.adminNotifications[idx] = notif;
        }
      })
      .addCase(sendAdminNotification.rejected, (state, { payload }) => {
        state.adminSubmitting = false; state.adminError = payload;
      });

    // Admin: duplicate
    builder
      .addCase(duplicateAdminNotification.fulfilled, (state, { payload }) => {
        if (payload && payload._id) state.adminNotifications.unshift(payload);
      });
  },
});

export const { 
  clearUserNotifications, 
  clearCurrentNotification,
  resetAdminError, 
  openNotificationModal, 
  closeNotificationModal 
} = notificationSlice.actions;

export default notificationSlice.reducer;
