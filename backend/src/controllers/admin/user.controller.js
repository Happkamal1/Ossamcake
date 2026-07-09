const userService = require("../../services/admin/user.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const MESSAGES = require("../../constants/messages");

const getAllUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  res.status(200).json(new ApiResponse(200, result, MESSAGES.USERS_FETCHED));
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await userService.updateUserStatus(req.params.id, req.body.accountStatus);
  res.status(200).json(new ApiResponse(200, user, MESSAGES.USER_UPDATED));
});

const updateUserRole = asyncHandler(async (req, res) => {
  const user = await userService.updateUserRole(req.params.id, req.body.role, req.user);
  res.status(200).json(new ApiResponse(200, user, "User role updated successfully"));
});

module.exports = { getAllUsers, getUserById, updateUserStatus, updateUserRole };
