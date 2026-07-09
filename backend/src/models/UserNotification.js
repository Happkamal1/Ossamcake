const mongoose = require("mongoose");

/**
 * UserNotification — Per-user delivery junction.
 * One document per (user, notification) pair.
 * Tracks read state, soft-deletion, and delivery timestamps.
 *
 * Future Socket.io: emit on bulk insert of these documents.
 * Future FCM:       send push notification after bulk insert.
 */
const userNotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    notification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient user-specific queries
userNotificationSchema.index({ user: 1, isDeleted: 1, createdAt: -1 });
userNotificationSchema.index({ user: 1, isRead: 1, isDeleted: 1 });
userNotificationSchema.index({ user: 1, notification: 1 }, { unique: true });

module.exports = mongoose.model("UserNotification", userNotificationSchema);
