const express = require("express");
const router = express.Router();

const {
  registerUser,
  verifyEmail,
  resendOtp,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  logoutUser,
  getMe,
  updateProfile,
  updatePassword,
  addAddress,
  deleteAddress,
  loginGoogle,
  verify2FALogin,
  toggle2FA,
  getPasskeyRegisterOptions,
  verifyPasskeyRegister,
  getPasskeyLoginOptions,
  verifyPasskeyLogin,
  deletePasskey,
  getPasskeySignupOptions,
  verifyPasskeySignup,
} = require("../controllers/authController");

const {
  validateRegister,
  validateLogin,
  validateEmailAndOtp,
  validateEmailOnly,
  validateResetPassword,
  checkValidation,
} = require("../validators/authValidator");

const { protect } = require("../middlewares/authMiddlewares");

// Public Routes
router.post("/register", validateRegister, checkValidation, registerUser);
router.post("/verify-email", validateEmailAndOtp, checkValidation, verifyEmail);
router.post("/resend-otp", validateEmailOnly, checkValidation, resendOtp);

router.post("/login", validateLogin, checkValidation, loginUser);

router.post("/forgot-password", validateEmailOnly, checkValidation, forgotPassword);
router.post("/verify-reset-otp", validateEmailAndOtp, checkValidation, verifyResetOtp);
router.post("/reset-password", validateResetPassword, checkValidation, resetPassword);
router.post("/google", loginGoogle);
router.post("/2fa/login-verify", verify2FALogin);
router.post("/passkey/login-options", getPasskeyLoginOptions);
router.post("/passkey/login-verify", verifyPasskeyLogin);
router.post("/passkey/signup-options", getPasskeySignupOptions);
router.post("/passkey/signup-verify", verifyPasskeySignup);

// Protected Routes
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/update-password", protect, updatePassword);
router.post("/addresses", protect, addAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);
router.post("/2fa/toggle", protect, toggle2FA);
router.get("/passkey/register-options", protect, getPasskeyRegisterOptions);
router.post("/passkey/register-verify", protect, verifyPasskeyRegister);
router.delete("/passkey/:credentialID", protect, deletePasskey);

module.exports = router;