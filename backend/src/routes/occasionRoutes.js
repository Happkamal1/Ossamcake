const express = require("express");
const router = express.Router();
const { getAllOccasions } = require("../controllers/occasionController");

// Public: GET /api/v1/occasions
router.get("/", getAllOccasions);

module.exports = router;
