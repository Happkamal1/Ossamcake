const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  googleLogin,
  facebookLogin,
  twitterLogin
} = require("../controllers/authController");

// Local Auth
router.post("/register", registerUser);
router.post("/login", loginUser);


// Social Login
router.get("/google", googleLogin);
router.get("/facebook", facebookLogin);
router.get("/twitter", twitterLogin);


module.exports = router;