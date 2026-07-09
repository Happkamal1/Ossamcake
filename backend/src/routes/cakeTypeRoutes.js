const express = require("express");
const router = express.Router();
const { getAllCakeTypes } = require("../controllers/cakeTypeController");

// Public: GET /api/v1/cake-types
router.get("/", getAllCakeTypes);

module.exports = router;
