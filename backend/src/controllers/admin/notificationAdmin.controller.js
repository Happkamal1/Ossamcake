const notificationService = require("../../services/notification.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

// GET /api/v1/admin/notifications
const getAllNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getAllNotifications(req.query);
  res.status(200).json(new ApiResponse(200, result, "Notifications fetched successfully"));
});

// GET /api/v1/admin/notifications/:id
const getNotificationById = asyncHandler(async (req, res) => {
  const notification = await notificationService.getNotificationById(req.params.id);
  res.status(200).json(new ApiResponse(200, notification, "Notification fetched successfully"));
});

// POST /api/v1/admin/notifications
const createNotification = asyncHandler(async (req, res) => {
  const { sendImmediately, ...data } = req.body;
  const notification = await notificationService.createNotification(data, req.user._id);

  if (sendImmediately) {
    const result = await notificationService.sendNotification(notification._id, req.user._id);
    return res.status(201).json(
      new ApiResponse(201, result, `Notification created and sent to ${result.recipientCount} users`)
    );
  }

  res.status(201).json(new ApiResponse(201, notification, "Notification created as draft"));
});

// PATCH /api/v1/admin/notifications/:id
const updateNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.updateNotification(req.params.id, req.body, req.user._id);
  res.status(200).json(new ApiResponse(200, notification, "Notification updated successfully"));
});

// DELETE /api/v1/admin/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id);
  res.status(200).json(new ApiResponse(200, null, "Notification deleted successfully"));
});

// POST /api/v1/admin/notifications/:id/send
const sendNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.sendNotification(req.params.id, req.user._id);
  res.status(200).json(
    new ApiResponse(200, result, `Notification sent to ${result.recipientCount} users`)
  );
});

// POST /api/v1/admin/notifications/:id/duplicate
const duplicateNotification = asyncHandler(async (req, res) => {
  const copy = await notificationService.duplicateNotification(req.params.id, req.user._id);
  res.status(201).json(new ApiResponse(201, copy, "Notification duplicated successfully"));
});

module.exports = {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  sendNotification,
  duplicateNotification,
};
