const express = require("express");
const router = express.Router();
const c = require("../../controllers/admin/cakeType.controller");

router.get("/", c.getAllCakeTypes);
router.get("/:id", c.getCakeTypeById);
router.post("/", c.createCakeType);
router.put("/:id", c.updateCakeType);
router.delete("/:id", c.deleteCakeType);

module.exports = router;
