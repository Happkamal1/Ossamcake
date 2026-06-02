const express = require("express");

const router = express.Router();

const {
  addCake,
  getCakes,
  getSingleCake
} = require("../controllers/cakeController");

router.post("/new-cake", addCake);
router.get("/get-cakes", getCakes);
router.get("/getSingleCake/:id", getSingleCake);

module.exports = router;