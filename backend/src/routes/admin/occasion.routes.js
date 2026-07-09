const express = require("express");
const router = express.Router();
const c = require("../../controllers/admin/occasion.controller");

router.get("/", c.getAllOccasions);
router.get("/:id", c.getOccasionById);
router.post("/", c.createOccasion);
router.put("/:id", c.updateOccasion);
router.delete("/:id", c.deleteOccasion);

module.exports = router;
