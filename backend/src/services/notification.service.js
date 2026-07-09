const Notification = require("../models/Notification");
const UserNotification = require("../models/UserNotification");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

// ── Future-ready channel imports ───────────────────────────────────────────────
const socketChannel = require("./notificationChannels/socket.channel");
const pushChannel   = require("./notificationChannels/push.channel");
const emailChannel  = require("./notificationChannels/email.channel");

// ─────────────────────────────────────────────────────────────────────────────
// Targeting — resolve which users receive a notification
// ─────────────────────────────────────────────────────────────────────────────
async function resolveTargetUsers(notification) {
  const { targetType, targetUsers, targetRole } = notification;

  switch (targetType) {
    case "all":
      return User.find({ accountStatus: "active" }).select("_id email").lean();

    case "specific":
    case "multiple":
      if (!targetUsers || targetUsers.length === 0) {
        throw new ApiError(400, "targetUsers cannot be empty for specific/multiple targeting");
      }
      return User.find({ _id: { $in: targetUsers }, accountStatus: "active" })
        .select("_id email").lean();

    case "role":
      if (!targetRole) throw new ApiError(400, "targetRole is required for role targeting");
      return User.find({ role: targetRole, accountStatus: "active" }).select("_id email").lean();

    case "new": {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return User.find({ createdAt: { $gte: thirtyDaysAgo }, accountStatus: "active" })
        .select("_id email").lean();
    }

    case "inactive": {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      // Users who haven't logged in or have old accounts
      return User.find({
        accountStatus: "active",
        updatedAt: { $lte: ninetyDaysAgo },
      }).select("_id email").lean();
    }

    default:
      return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fanout — bulk-insert UserNotification documents for resolved users
// This is the SINGLE entry point for all notification delivery.
// Future channels (Socket.io, FCM, Email) are activated here.
// ─────────────────────────────────────────────────────────────────────────────
async function fanoutNotification(notification, users) {
  if (!users || users.length === 0) return 0;

  // Build bulk insert documents (upsert to avoid duplicates on re-send)
  const docs = users.map((user) => ({
    updateOne: {
      filter: { user: user._id, notification: notification._id },
      update: {
        $setOnInsert: {
          user: user._id,
          notification: notification._id,
          isRead: false,
          isDeleted: false,
        },
      },
      upsert: true,
    },
  }));

  await UserNotification.bulkWrite(docs, { ordered: false });

  // ── Future channels (activated by .env flags) ──────────────────────────────
  if (process.env.SOCKET_ENABLED === "true") {
    await socketChannel.send(notification, users).catch(console.error);
  }
  if (process.env.FCM_ENABLED === "true") {
    await pushChannel.send(notification, users).catch(console.error);
  }
  if (process.env.EMAIL_NOTIFICATIONS_ENABLED === "true") {
    await emailChannel.send(notification, users).catch(console.error);
  }

  return users.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin — CRUD operations
// ─────────────────────────────────────────────────────────────────────────────
async function getAllNotifications(query = {}) {
  const {
    page = 1, limit = 15, search = "",
    status, type, priority, sort = "-createdAt",
  } = query;

  const filter = {};
  if (status)  filter.status = status;
  if (type)    filter.type = type;
  if (priority) filter.priority = priority;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { shortDescription: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate("createdBy", "name email")
      .lean(),
    Notification.countDocuments(filter),
  ]);

  return {
    notifications,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
}

async function getNotificationById(id) {
  const notification = await Notification.findById(id).populate("createdBy", "name email");
  if (!notification) throw new ApiError(404, "Notification not found");
  return notification;
}

function cleanNotificationData(data) {
  const cleaned = { ...data };
  if (cleaned.targetRole === "") cleaned.targetRole = null;
  if (cleaned.buttonText === "") cleaned.buttonText = null;
  if (cleaned.buttonLink === "") cleaned.buttonLink = null;
  if (cleaned.image === "") cleaned.image = null;
  if (cleaned.relatedProduct === "") cleaned.relatedProduct = null;
  if (cleaned.relatedOrder === "") cleaned.relatedOrder = null;
  if (cleaned.scheduledAt === "") cleaned.scheduledAt = null;
  if (cleaned.expiresAt === "") cleaned.expiresAt = null;
  return cleaned;
}

async function createNotification(data, adminId) {
  const cleaned = cleanNotificationData(data);
  const notification = await Notification.create({ ...cleaned, createdBy: adminId });
  return notification;
}

async function sendNotification(notificationId, adminId) {
  const notification = await Notification.findById(notificationId);
  if (!notification) throw new ApiError(404, "Notification not found");
  if (notification.status === "expired") throw new ApiError(400, "Cannot send an expired notification");

  const users = await resolveTargetUsers(notification);
  const count = await fanoutNotification(notification, users);

  notification.status = "active";
  notification.sentAt  = new Date();
  notification.updatedBy = adminId;
  await notification.save();

  return { notification, recipientCount: count };
}

async function updateNotification(id, data, adminId) {
  const cleaned = cleanNotificationData(data);
  const notification = await Notification.findByIdAndUpdate(
    id,
    { ...cleaned, updatedBy: adminId },
    { new: true, runValidators: true }
  );
  if (!notification) throw new ApiError(404, "Notification not found");
  return notification;
}

async function deleteNotification(id) {
  const notification = await Notification.findByIdAndDelete(id);
  if (!notification) throw new ApiError(404, "Notification not found");
  // Also clean up all user notification records
  await UserNotification.deleteMany({ notification: id });
  return notification;
}

async function duplicateNotification(id, adminId) {
  const original = await Notification.findById(id).lean();
  if (!original) throw new ApiError(404, "Notification not found");

  const { _id, createdAt, updatedAt, sentAt, ...rest } = original;
  const copy = await Notification.create({
    ...rest,
    title: `[Copy] ${original.title}`,
    status: "draft",
    sentAt: null,
    createdBy: adminId,
  });
  return copy;
}

// ─────────────────────────────────────────────────────────────────────────────
// Scheduled Notification Dispatcher
// Called by node-cron in server.js every minute
// ─────────────────────────────────────────────────────────────────────────────
async function dispatchScheduledNotifications() {
  const now = new Date();
  const due = await Notification.find({
    status: "scheduled",
    scheduledAt: { $lte: now },
  });

  for (const notification of due) {
    try {
      const users = await resolveTargetUsers(notification);
      await fanoutNotification(notification, users);
      notification.status = "active";
      notification.sentAt = now;
      await notification.save();
    } catch (err) {
      console.error(`[Scheduler] Failed to dispatch notification ${notification._id}:`, err.message);
    }
  }

  // Mark expired notifications
  await Notification.updateMany(
    { status: "active", expiresAt: { $lte: now, $ne: null } },
    { status: "expired" }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// User-Facing operations
// ─────────────────────────────────────────────────────────────────────────────
async function getUserNotifications(userId, query = {}) {
  const { page = 1, limit = 15 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = { user: userId, isDeleted: false };

  const [items, total, unreadCount] = await Promise.all([
    UserNotification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: "notification",
        match: { status: { $in: ["active"] } },
        select: "-targetUsers -updatedBy",
      })
      .lean(),
    UserNotification.countDocuments(filter),
    UserNotification.countDocuments({ user: userId, isDeleted: false, isRead: false }),
  ]);

  // Filter out items where notification was deleted or not yet active
  const filtered = items.filter((item) => item.notification !== null);

  return {
    notifications: filtered,
    pagination: {
      total: filtered.length,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
    unreadCount,
  };
}

async function getUnreadCount(userId) {
  return UserNotification.countDocuments({
    user: userId,
    isRead: false,
    isDeleted: false,
  });
}

async function markAsRead(userId, notificationId) {
  const doc = await UserNotification.findOneAndUpdate(
    { user: userId, notification: notificationId, isDeleted: false },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  if (!doc) throw new ApiError(404, "Notification not found");
  return doc;
}

async function markAllAsRead(userId) {
  await UserNotification.updateMany(
    { user: userId, isRead: false, isDeleted: false },
    { isRead: true, readAt: new Date() }
  );
}

async function softDeleteUserNotification(userId, notificationId) {
  const doc = await UserNotification.findOneAndUpdate(
    { user: userId, notification: notificationId, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
  if (!doc) throw new ApiError(404, "Notification not found");
  return doc;
}

module.exports = {
  // Admin
  getAllNotifications,
  getNotificationById,
  createNotification,
  sendNotification,
  updateNotification,
  deleteNotification,
  duplicateNotification,
  dispatchScheduledNotifications,
  // User
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  softDeleteUserNotification,
};
