const express = require("express");
const router  = express.Router();
const { protect } = require("../middlewares/authMiddlewares");
const c = require("../controllers/notification.controller");

// All notification routes require authentication
router.use(protect);

// ── List & count ───────────────────────────────────────────────────────────────
router.get("/",             c.getMyNotifications);
router.get("/unread-count", c.getUnreadCount);

// ── Slug-based detail (MUST be before /:id to avoid conflict) ─────────────────
router.get("/slug/:slug",   c.getNotificationBySlug);

// ── Bulk mutations ─────────────────────────────────────────────────────────────
router.patch("/read-all",   c.markAllAsRead);

// ── ObjectId-based operations ─────────────────────────────────────────────────
router.get("/:id",          c.getNotificationById);     // backward compat
router.patch("/:id/read",   c.markAsRead);
router.delete("/:id",       c.deleteNotification);

module.exports = router;
