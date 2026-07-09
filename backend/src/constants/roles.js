/**
 * Application Role Constants
 * Single source of truth for all user roles across the entire backend.
 * Import this instead of using raw strings like "admin".
 */
const ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

module.exports = ROLES;
