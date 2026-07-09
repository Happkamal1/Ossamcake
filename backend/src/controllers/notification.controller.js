const notificationService = require("../services/notification.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/v1/notifications
const getMyNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getUserNotifications(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, result, "Notifications fetched successfully"));
});

// GET /api/v1/notifications/unread-count
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);
  res.status(200).json(new ApiResponse(200, { count }, "Unread count fetched successfully"));
});

// PATCH /api/v1/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAsRead(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, null, "Notification marked as read"));
});

// PATCH /api/v1/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  res.status(200).json(new ApiResponse(200, null, "All notifications marked as read"));
});

// DELETE /api/v1/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.softDeleteUserNotification(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, null, "Notification deleted"));
});

module.exports = { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification };
