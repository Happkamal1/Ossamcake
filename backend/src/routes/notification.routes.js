const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddlewares");
const c = require("../controllers/notification.controller");

// All notification routes require authentication
router.use(protect);

router.get("/",               c.getMyNotifications);
router.get("/unread-count",   c.getUnreadCount);
router.patch("/read-all",     c.markAllAsRead);
router.patch("/:id/read",     c.markAsRead);
router.delete("/:id",         c.deleteNotification);

module.exports = router;
