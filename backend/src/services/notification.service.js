const Notification = require("../models/Notification");
const UserNotification = require("../models/UserNotification");
const User = require("../models/User");
// Import Cake so Mongoose registers the model before any populate() that references "Cake"
require("../models/Cake");
require("../models/Order");
const ApiError = require("../utils/ApiError");

// ── Future-ready channel imports ───────────────────────────────────────────────
const socketChannel = require("./notificationChannels/socket.channel");
const pushChannel   = require("./notificationChannels/push.channel");
const emailChannel  = require("./notificationChannels/email.channel");

// ─────────────────────────────────────────────────────────────────────────────
// Safe populate builder
// Always specify the correct model names ("Cake" not "Product").
// Only adds a sub-populate entry if the field is non-null, preventing
// the "Schema hasn't been registered for model 'Product'" crash.
// ─────────────────────────────────────────────────────────────────────────────
function buildNotificationPopulate() {
  return {
    path: "notification",
    select: "-targetUsers -updatedBy",
    populate: [
      {
        path: "relatedProduct",
        model: "Cake",                 // exact registered model name
        select: "name thumbnail slug basePrice",
      },
      {
        path: "relatedOrder",
        model: "Order",
        select: "orderNumber orderStatus createdAt grandTotal",
      },
    ],
  };
}

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
// ─────────────────────────────────────────────────────────────────────────────
async function fanoutNotification(notification, users) {
  if (!users || users.length === 0) return 0;

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
  if (status)   filter.status = status;
  if (type)     filter.type = type;
  if (priority) filter.priority = priority;
  if (search) {
    filter.$or = [
      { title:            { $regex: search, $options: "i" } },
      { shortDescription: { $regex: search, $options: "i" } },
      { slug:             { $regex: search, $options: "i" } },
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
      page:       Number(page),
      limit:      Number(limit),
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
  if (cleaned.targetRole     === "") cleaned.targetRole     = null;
  if (cleaned.buttonText     === "") cleaned.buttonText     = null;
  if (cleaned.buttonLink     === "") cleaned.buttonLink     = null;
  if (cleaned.image          === "") cleaned.image          = null;
  if (cleaned.relatedProduct === "") cleaned.relatedProduct = null;
  if (cleaned.relatedOrder   === "") cleaned.relatedOrder   = null;
  if (cleaned.scheduledAt    === "") cleaned.scheduledAt    = null;
  if (cleaned.expiresAt      === "") cleaned.expiresAt      = null;
  return cleaned;
}

async function createNotification(data, adminId) {
  const cleaned = cleanNotificationData(data);

  // If admin supplied a custom slug, validate uniqueness
  if (cleaned.slug) {
    cleaned.slug = cleaned.slug.toLowerCase().trim().replace(/\s+/g, "-");
    const exists = await Notification.findOne({ slug: cleaned.slug });
    if (exists) throw new ApiError(409, `Slug "${cleaned.slug}" is already in use`);
  }
  // If no slug supplied, the pre-save hook generates it from title

  const notification = await Notification.create({ ...cleaned, createdBy: adminId });
  return notification;
}

async function sendNotification(notificationId, adminId) {
  const notification = await Notification.findById(notificationId);
  if (!notification) throw new ApiError(404, "Notification not found");
  if (notification.status === "expired") throw new ApiError(400, "Cannot send an expired notification");

  const users = await resolveTargetUsers(notification);
  const count  = await fanoutNotification(notification, users);

  notification.status    = "active";
  notification.sentAt    = new Date();
  notification.updatedBy = adminId;
  await notification.save();

  return { notification, recipientCount: count };
}

async function updateNotification(id, data, adminId) {
  const cleaned = cleanNotificationData(data);

  // Validate slug uniqueness if admin is changing it
  if (cleaned.slug) {
    cleaned.slug = cleaned.slug.toLowerCase().trim().replace(/\s+/g, "-");
    const exists = await Notification.findOne({ slug: cleaned.slug, _id: { $ne: id } });
    if (exists) throw new ApiError(409, `Slug "${cleaned.slug}" is already in use`);
  }

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
  await UserNotification.deleteMany({ notification: id });
  return notification;
}

async function duplicateNotification(id, adminId) {
  const original = await Notification.findById(id).lean();
  if (!original) throw new ApiError(404, "Notification not found");

  const { _id, slug, createdAt, updatedAt, sentAt, ...rest } = original;
  // Generate a new unique slug for the copy (pre-save hook will handle it)
  const copy = await Notification.create({
    ...rest,
    title:     `[Copy] ${original.title}`,
    slug:      undefined,   // let pre-save hook generate
    status:    "draft",
    sentAt:    null,
    createdBy: adminId,
  });
  return copy;
}

// ─────────────────────────────────────────────────────────────────────────────
// Scheduled Notification Dispatcher
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
        select: "title slug shortDescription image type priority buttonText buttonLink createdAt sentAt",
      })
      .lean(),
    UserNotification.countDocuments(filter),
    UserNotification.countDocuments({ user: userId, isDeleted: false, isRead: false }),
  ]);

  const filtered = items.filter((item) => item.notification !== null);

  return {
    notifications: filtered,
    pagination: {
      total:      filtered.length,
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
    unreadCount,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// getUserNotificationBySlug
// Looks up the Notification by its SEO slug, then finds the UserNotification.
// Uses safe populate with explicit model references — never crashes on missing refs.
// ─────────────────────────────────────────────────────────────────────────────
async function getUserNotificationBySlug(userId, slug) {
  // Step 1: find the master notification by slug
  const notification = await Notification.findOne({ slug, status: "active" })
    .select("-targetUsers -updatedBy")
    .lean();

  if (!notification) throw new ApiError(404, "Notification not found");

  // Step 2: find this user's junction record
  const userNotif = await UserNotification.findOne({
    user:         userId,
    notification: notification._id,
    isDeleted:    false,
  }).lean();

  if (!userNotif) throw new ApiError(404, "Notification not found");

  // Step 3: safe populate of relatedProduct (ref: "Cake") — only if field is set
  let relatedProduct = null;
  if (notification.relatedProduct) {
    try {
      const Cake = require("../models/Cake");
      relatedProduct = await Cake.findById(notification.relatedProduct)
        .select("name thumbnail slug basePrice")
        .lean();
    } catch (e) {
      console.warn("[Notification] Could not populate relatedProduct:", e.message);
    }
  }

  // Step 4: safe populate of relatedOrder — only if field is set
  let relatedOrder = null;
  if (notification.relatedOrder) {
    try {
      const Order = require("../models/Order");
      relatedOrder = await Order.findById(notification.relatedOrder)
        .select("orderNumber orderStatus createdAt grandTotal")
        .lean();
    } catch (e) {
      console.warn("[Notification] Could not populate relatedOrder:", e.message);
    }
  }

  // Step 5: auto-mark as read
  if (!userNotif.isRead) {
    await UserNotification.updateOne(
      { _id: userNotif._id },
      { isRead: true, readAt: new Date() }
    );
    userNotif.isRead = true;
    userNotif.readAt = new Date();
  }

  return {
    ...userNotif,
    notification: {
      ...notification,
      relatedProduct,
      relatedOrder,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// getUserNotificationById — kept for backward compat (marks-read on open)
// ─────────────────────────────────────────────────────────────────────────────
async function getUserNotificationById(userId, notificationId) {
  const userNotif = await UserNotification.findOne({
    user:         userId,
    notification: notificationId,
    isDeleted:    false,
  }).lean();

  if (!userNotif) throw new ApiError(404, "Notification not found");

  const notification = await Notification.findOne({
    _id:    notificationId,
    status: "active",
  }).select("-targetUsers -updatedBy").lean();

  if (!notification) throw new ApiError(404, "Notification not found");

  let relatedProduct = null;
  if (notification.relatedProduct) {
    try {
      const Cake = require("../models/Cake");
      relatedProduct = await Cake.findById(notification.relatedProduct)
        .select("name thumbnail slug basePrice").lean();
    } catch (e) {
      console.warn("[Notification] relatedProduct populate skipped:", e.message);
    }
  }

  let relatedOrder = null;
  if (notification.relatedOrder) {
    try {
      const Order = require("../models/Order");
      relatedOrder = await Order.findById(notification.relatedOrder)
        .select("orderNumber orderStatus createdAt grandTotal").lean();
    } catch (e) {
      console.warn("[Notification] relatedOrder populate skipped:", e.message);
    }
  }

  if (!userNotif.isRead) {
    await UserNotification.updateOne(
      { _id: userNotif._id },
      { isRead: true, readAt: new Date() }
    );
    userNotif.isRead = true;
    userNotif.readAt = new Date();
  }

  return {
    ...userNotif,
    notification: { ...notification, relatedProduct, relatedOrder },
  };
}

async function getUnreadCount(userId) {
  return UserNotification.countDocuments({
    user:      userId,
    isRead:    false,
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
  getUserNotificationBySlug,
  getUserNotificationById,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  softDeleteUserNotification,
};
