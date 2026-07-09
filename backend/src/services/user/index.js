/**
 * User Services — Feature Module Entry Point
 * Exports both userService and addressService.
 */
const userService = require("../userService");
const addressService = require("../addressService");
module.exports = { ...userService, ...addressService };
