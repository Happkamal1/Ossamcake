const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const fs = require("fs");
const path = require("path");

/**
 * Get user profile excluding sensitive fields
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select("-password -refreshToken -__v");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};

/**
 * Update user profile allowed fields
 */
const updateProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Map request fields to schema fields
  if (updateData.name !== undefined) user.name = updateData.name;
  if (updateData.phone !== undefined) user.mobileNumber = updateData.phone;
  if (updateData.gender !== undefined) user.gender = updateData.gender;
  if (updateData.dateOfBirth !== undefined) user.birthdate = updateData.dateOfBirth;
  if (updateData.bio !== undefined) user.bio = updateData.bio;
  if (updateData.profileImage !== undefined) {
    const oldImage = user.profileImage;
    user.profileImage = updateData.profileImage;
    if (!updateData.profileImage && oldImage && oldImage.startsWith("/uploads/avatars/")) {
      const storageService = require("../utils/storage.service");
      storageService.delete(oldImage).catch(err => {
        console.error("Failed to delete old avatar file on remove:", err.message);
      });
    }
  }

  await user.save();

  return await User.findById(userId).select("-password -refreshToken -__v");
};

/**
 * Update user avatar, delete old local file if exists
 */
const updateAvatar = async (userId, file) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const oldImage = user.profileImage;

  // Save new avatar path (served statically via /uploads)
  user.profileImage = file.url;
  await user.save();

  // Delete old avatar file if it exists
  if (oldImage) {
    const storageService = require("../utils/storage.service");
    try {
      const publicId = storageService.extractPublicIdFromUrl(oldImage) || oldImage;
      await storageService.delete(publicId);
    } catch (err) {
      console.error("Failed to delete old avatar file:", err.message);
    }
  }

  return await User.findById(userId).select("-password -refreshToken -__v");
};

/**
 * Change local user password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Google-only users cannot change password
  if (user.provider === "google" && !user.password) {
    throw new ApiError(400, "Google accounts do not have a password configured. Please use Google Login.");
  }

  // Verify current password
  const isCorrect = await user.isPasswordCorrect(currentPassword);
  if (!isCorrect) {
    throw new ApiError(400, "Incorrect current password");
  }

  // Save new password
  user.password = newPassword;
  await user.save();

  return true;
};

/**
 * Get user security status dashboard details
 */
const getSecurityInfo = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    emailVerified: user.isEmailVerified,
    googleConnected: !!user.googleId || user.provider === "google",
    is2FAEnabled: user.is2FAEnabled,
    passkeyStatus: user.passkeys && user.passkeys.length > 0,
    registeredPasskeys: (user.passkeys || []).map(p => ({
      id: p.credentialID,
      deviceType: p.deviceType,
      createdAt: p.createdAt,
    })),
    lastLogin: user.lastLogin || user.updatedAt,
  };
};

module.exports = {
  getUserProfile,
  updateProfile,
  updateAvatar,
  changePassword,
  getSecurityInfo,
};
