const express = require("express");
const router = express.Router();
const c = require("../../controllers/admin/user.controller");

router.get("/", c.getAllUsers);
router.get("/:id", c.getUserById);
router.patch("/:id/status", c.updateUserStatus);
router.patch("/:id/role", c.updateUserRole);

module.exports = router;
