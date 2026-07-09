const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getSecurityInfo,
  toggle2FA,
  getPasskeys,
  deletePasskey,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/userController");

const {
  validateUpdateProfile,
  validateChangePassword,
  validateAddress,
  validateAddressId,
  validateUpdateAddress,
} = require("../validators/userValidator");

const { protect } = require("../middlewares/authMiddlewares");
const { uploadAvatar: multerUpload } = require("../middlewares/uploadMiddleware");

// All routes here require authentication (JWT protection)
router.use(protect);

// Profile Management
router.get("/profile", getUserProfile);
router.patch("/profile", validateUpdateProfile, updateProfile);
router.post("/avatar", multerUpload, uploadAvatar);
router.patch("/change-password", validateChangePassword, changePassword);

// Security Dashboard & Biometrics
router.get("/security", getSecurityInfo);
router.patch("/security/2fa", toggle2FA);
router.get("/passkeys", getPasskeys);
router.delete("/passkeys/:id", deletePasskey);

// Address Management
router.get("/addresses", getAddresses);
router.post("/addresses", validateAddress, createAddress);
router.patch("/addresses/:id", validateUpdateAddress, updateAddress);
router.delete("/addresses/:id", validateAddressId, deleteAddress);
router.patch("/addresses/:id/default", validateAddressId, setDefaultAddress);

module.exports = router;
