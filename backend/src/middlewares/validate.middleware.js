const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");
const MESSAGES = require("../constants/messages");

/**
 * Centralized Validation Result Checker
 * Use this after any express-validator chain instead of duplicating
 * the validationResult check in every validator file.
 *
 * Usage:
 *   router.post("/route", [...validators], validate, controller);
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return next(new ApiError(400, MESSAGES.VALIDATION_FAILED, formattedErrors));
  }
  next();
};

module.exports = validate;
