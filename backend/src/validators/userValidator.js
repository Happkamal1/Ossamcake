const { body, param } = require("express-validator");
const { checkValidation } = require("./authValidator");

const validateUpdateProfile = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters"),
  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-\s]{10,15}$/)
    .withMessage("Must be a valid mobile phone number"),
  body("gender")
    .optional()
    .trim()
    .isIn(["Male", "Female", "Other", "Prefer not to say"])
    .withMessage("Gender must be one of: Male, Female, Other, Prefer not to say"),
  body("dateOfBirth")
    .optional({ checkFalsy: true })
    .trim()
    .isISO8601()
    .withMessage("Date of birth must be a valid ISO8601 date (YYYY-MM-DD)"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),
  body("profileImage")
    .optional()
    .trim(),
  checkValidation,
];

const validateChangePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
  checkValidation,
];

const validateAddress = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),
  body("mobileNumber")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .matches(/^[0-9+\-\s]{10,15}$/)
    .withMessage("Must be a valid mobile phone number"),
  body("alternateMobile")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-\s]{10,15}$/)
    .withMessage("Alternate mobile must be a valid mobile phone number"),
  body("addressLine1")
    .trim()
    .notEmpty()
    .withMessage("Address Line 1 is required"),
  body("addressLine2")
    .optional()
    .trim(),
  body("landmark")
    .optional()
    .trim(),
  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),
  body("state")
    .trim()
    .notEmpty()
    .withMessage("State is required"),
  body("country")
    .trim()
    .notEmpty()
    .withMessage("Country is required"),
  body("pincode")
    .trim()
    .notEmpty()
    .withMessage("Pincode/Zipcode is required"),
  body("addressType")
    .optional()
    .trim()
    .isIn(["Home", "Office", "Other"])
    .withMessage("Address type must be one of: Home, Office, Other"),
  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be a boolean"),
  checkValidation,
];

const validateAddressId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid address ID format"),
  checkValidation,
];

const validateUpdateAddress = [
  param("id")
    .isMongoId()
    .withMessage("Invalid address ID format"),
  body("fullName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Full name cannot be empty"),
  body("mobileNumber")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Mobile number cannot be empty")
    .matches(/^[0-9+\-\s]{10,15}$/)
    .withMessage("Must be a valid mobile phone number"),
  body("alternateMobile")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-\s]{10,15}$/)
    .withMessage("Alternate mobile must be a valid mobile phone number"),
  body("addressLine1")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Address Line 1 cannot be empty"),
  body("addressLine2")
    .optional()
    .trim(),
  body("landmark")
    .optional()
    .trim(),
  body("city")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("City cannot be empty"),
  body("state")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("State cannot be empty"),
  body("country")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Country cannot be empty"),
  body("pincode")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Pincode/Zipcode cannot be empty"),
  body("addressType")
    .optional()
    .trim()
    .isIn(["Home", "Office", "Other"])
    .withMessage("Address type must be one of: Home, Office, Other"),
  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be a boolean"),
  checkValidation,
];

module.exports = {
  validateUpdateProfile,
  validateChangePassword,
  validateAddress,
  validateAddressId,
  validateUpdateAddress,
};
