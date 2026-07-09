const userService = require("../services/userService");
const addressService = require("../services/addressService");
const authService = require("../services/authService");
const passkeyService = require("../services/passkeyService");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

/**
 * GET /api/users/profile
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getUserProfile(req.user._id);
  res.status(200).json(new ApiResponse(200, profile, "Profile retrieved successfully"));
});

/**
 * PATCH /api/users/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const profile = await userService.updateProfile(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, profile, "Profile updated successfully"));
});

/**
 * POST /api/users/avatar
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please upload an avatar image file");
  }

  const profile = await userService.updateAvatar(req.user._id, req.file);
  res.status(200).json(new ApiResponse(200, profile, "Avatar uploaded successfully"));
});

/**
 * PATCH /api/users/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user._id, currentPassword, newPassword);
  res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
});

/**
 * GET /api/users/security
 */
const getSecurityInfo = asyncHandler(async (req, res) => {
  const securityInfo = await userService.getSecurityInfo(req.user._id);
  res.status(200).json(new ApiResponse(200, securityInfo, "Security status retrieved successfully"));
});

/**
 * PATCH /api/users/security/2fa
 */
const toggle2FA = asyncHandler(async (req, res) => {
  const { enable } = req.body;
  if (enable === undefined) {
    throw new ApiError(400, "Enable status is required (true/false)");
  }

  const updatedUser = await authService.toggle2FA(req.user._id, enable);
  res.status(200).json(new ApiResponse(200, updatedUser, `2FA has been ${enable ? 'enabled' : 'disabled'} successfully`));
});

/**
 * GET /api/users/passkeys
 */
const getPasskeys = asyncHandler(async (req, res) => {
  const securityInfo = await userService.getSecurityInfo(req.user._id);
  res.status(200).json(new ApiResponse(200, securityInfo.registeredPasskeys, "Registered passkeys retrieved successfully"));
});

/**
 * DELETE /api/users/passkeys/:id
 */
const deletePasskey = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Credential ID is required");
  }

  const updatedUser = await passkeyService.removePasskey(req.user, id);
  res.status(200).json(new ApiResponse(200, updatedUser, "Passkey removed successfully"));
});

/**
 * GET /api/users/addresses
 */
const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getAddresses(req.user._id);
  res.status(200).json(new ApiResponse(200, addresses, "Addresses retrieved successfully"));
});

/**
 * POST /api/users/addresses
 */
const createAddress = asyncHandler(async (req, res) => {
  const address = await addressService.createAddress(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, address, "Address created successfully"));
});

/**
 * PATCH /api/users/addresses/:id
 */
const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const address = await addressService.updateAddress(req.user._id, id, req.body);
  res.status(200).json(new ApiResponse(200, address, "Address updated successfully"));
});

/**
 * DELETE /api/users/addresses/:id
 */
const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await addressService.deleteAddress(req.user._id, id);
  res.status(200).json(new ApiResponse(200, null, "Address deleted successfully"));
});

/**
 * PATCH /api/users/addresses/:id/default
 */
const setDefaultAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const address = await addressService.setDefaultAddress(req.user._id, id);
  res.status(200).json(new ApiResponse(200, address, "Default address updated successfully"));
});

module.exports = {
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
};
