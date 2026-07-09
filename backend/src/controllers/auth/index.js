/**
 * Auth Controllers — Feature Module Entry Point
 * Re-exports from the root-level authController.js
 * while we progressively reorganize the codebase.
 *
 * Phase 5: This module is the canonical import path.
 * Routes import from here. The underlying file stays at its current location.
 */
module.exports = require("../authController");
