const { body, param, query } = require("express-validator");

/**
 * Payment Validators
 * Validates all payment-related requests
 */

/**
 * Validate create payment order request
 */
const validateCreateOrder = [
  body("orderId")
    .notEmpty()
    .withMessage("Order ID is required")
    .isMongoId()
    .withMessage("Invalid order ID format"),
];

/**
 * Validate payment verification request
 */
const validatePaymentVerification = [
  body("razorpay_order_id")
    .notEmpty()
    .withMessage("Razorpay order ID is required")
    .isString()
    .withMessage("Invalid order ID format"),
  
  body("razorpay_payment_id")
    .notEmpty()
    .withMessage("Razorpay payment ID is required")
    .isString()
    .withMessage("Invalid payment ID format"),
  
  body("razorpay_signature")
    .notEmpty()
    .withMessage("Razorpay signature is required")
    .isString()
    .withMessage("Invalid signature format"),
];

/**
 * Validate payment failure request
 */
const validatePaymentFailure = [
  body("razorpay_order_id")
    .notEmpty()
    .withMessage("Razorpay order ID is required"),
  
  body("error_code")
    .optional()
    .isString()
    .withMessage("Error code must be a string"),
  
  body("error_description")
    .optional()
    .isString()
    .withMessage("Error description must be a string"),
  
  body("error_source")
    .optional()
    .isString()
    .withMessage("Error source must be a string"),
  
  body("error_step")
    .optional()
    .isString()
    .withMessage("Error step must be a string"),
  
  body("error_reason")
    .optional()
    .isString()
    .withMessage("Error reason must be a string"),
];

/**
 * Validate payment ID parameter
 */
const validatePaymentId = [
  param("paymentId")
    .notEmpty()
    .withMessage("Payment ID is required")
    .custom((value) => {
      // Allow MongoDB ObjectId or Razorpay order/payment ID format
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(value);
      const isRazorpayId = /^(order_|pay_)/.test(value);
      
      if (!isMongoId && !isRazorpayId) {
        throw new Error("Invalid payment ID format");
      }
      return true;
    }),
];

/**
 * Validate payment history filters
 */
const validatePaymentHistory = [
  query("status")
    .optional()
    .isIn([
      "created",
      "attempted",
      "authorized",
      "captured",
      "failed",
      "refunded",
      "cancelled",
    ])
    .withMessage("Invalid payment status"),
  
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid start date format"),
  
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid end date format"),
  
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

/**
 * Validate refund request
 */
const validateRefund = [
  param("paymentId")
    .notEmpty()
    .withMessage("Payment ID is required")
    .isMongoId()
    .withMessage("Invalid payment ID format"),
  
  body("amount")
    .optional()
    .isNumeric()
    .withMessage("Amount must be numeric")
    .custom((value) => {
      if (value && value <= 0) {
        throw new Error("Amount must be greater than 0");
      }
      return true;
    }),
  
  body("reason")
    .optional()
    .isString()
    .withMessage("Reason must be a string")
    .isLength({ max: 500 })
    .withMessage("Reason cannot exceed 500 characters"),
];

/**
 * Validate webhook payload (basic validation)
 */
const validateWebhook = [
  body("event")
    .notEmpty()
    .withMessage("Webhook event is required")
    .isString()
    .withMessage("Event must be a string"),
  
  body("payload")
    .notEmpty()
    .withMessage("Webhook payload is required")
    .isObject()
    .withMessage("Payload must be an object"),
];

module.exports = {
  validateCreateOrder,
  validatePaymentVerification,
  validatePaymentFailure,
  validatePaymentId,
  validatePaymentHistory,
  validateRefund,
  validateWebhook,
};
