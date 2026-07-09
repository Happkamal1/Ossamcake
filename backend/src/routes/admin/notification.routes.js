const express = require("express");
const router = express.Router();
const c = require("../../controllers/admin/notificationAdmin.controller");

// Guards are applied at the parent adminRouter level (protect + authorize)
router.get("/",                c.getAllNotifications);
router.get("/:id",             c.getNotificationById);
router.post("/",               c.createNotification);
router.patch("/:id",           c.updateNotification);
router.delete("/:id",          c.deleteNotification);
router.post("/:id/send",       c.sendNotification);
router.post("/:id/duplicate",  c.duplicateNotification);

module.exports = router;
