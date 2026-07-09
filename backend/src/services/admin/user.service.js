const User = require("../../models/User");
const ApiError = require("../../utils/ApiError");
const { parsePagination, parseSort, parseSearch, buildPaginationMeta } = require("../../utils/queryBuilder");
const ROLES = require("../../constants/roles");

const getAllUsers = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);
  const sort = parseSort(query.sort, "createdAt:-1");
  const filter = {};

  if (query.role) filter.role = query.role;
  if (query.status) filter.accountStatus = query.status;
  if (query.isEmailVerified !== undefined) filter.isEmailVerified = query.isEmailVerified === "true";

  const searchFilter = parseSearch(query.search, ["name", "email"]);
  if (searchFilter) Object.assign(filter, searchFilter);

  const [users, total] = await Promise.all([
    User.find(filter).select("-password -refreshToken -passkeys").sort(sort).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  return { users, pagination: buildPaginationMeta(total, page, limit) };
};

const getUserById = async (id) => {
  const user = await User.findById(id).select("-password -refreshToken").lean();
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

const updateUserStatus = async (id, accountStatus) => {
  const validStatuses = ["active", "inactive", "suspended"];
  if (!validStatuses.includes(accountStatus)) {
    throw new ApiError(400, `Invalid account status. Must be one of: ${validStatuses.join(", ")}`);
  }
  const user = await User.findByIdAndUpdate(id, { accountStatus }, { new: true }).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

const updateUserRole = async (id, role, requestingUser) => {
  const validRoles = [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN];
  if (!validRoles.includes(role)) {
    throw new ApiError(400, `Invalid role. Must be one of: ${validRoles.join(", ")}`);
  }
  // Only super_admin can assign super_admin or admin roles
  if (role === ROLES.SUPER_ADMIN && requestingUser.role !== ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "Only super admins can promote users to super_admin");
  }
  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

module.exports = { getAllUsers, getUserById, updateUserStatus, updateUserRole };
