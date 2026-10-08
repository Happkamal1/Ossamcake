const express = require("express");
const router = express.Router();
const {
  getConfigStatus,
  getRazorpayKey,
  getStripeKey,
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  createStripeIntent,
  confirmStripePayment,
  handleStripeWebhook,
  getPaymentStatus,
  getPaymentHistory,
  handleWebhook,
  initiateRefund,
  retryPayment,
} = require("../controllers/paymentController");
const { protect, authorize } = require("../middlewares/authMiddlewares");
const validate = require("../middlewares/validate.middleware");
const {
  validateCreateOrder,
  validatePaymentVerification,
  validatePaymentFailure,
  validatePaymentId,
  validatePaymentHistory,
  validateRefund,
  validateWebhook,
} = require("../validators/payment.validator");

// ===== Public Routes =====

/**
 * @route   GET /api/v1/payments/config
 * @desc    Get payment gateway configuration status
 * @access  Public
 */
router.get("/config", getConfigStatus);

/**
 * @route   GET /api/v1/payments/key
 * @desc    Get Razorpay Key ID for frontend
 * @access  Public
 */
router.get("/key", getRazorpayKey);

/**
 * @route   GET /api/v1/payments/stripe/key
 * @desc    Get Stripe Publishable Key for frontend
 * @access  Public
 */
router.get("/stripe/key", getStripeKey);

/**
 * @route   POST /api/v1/payments/webhook
 * @desc    Handle Razorpay webhooks
 * @access  Public (signature verified internally)
 */
router.post("/webhook", validateWebhook, validate, handleWebhook);

/**
 * @route   POST /api/v1/payments/stripe/webhook
 * @desc    Handle Stripe webhooks
 * @access  Public (signature verified internally)
 */
router.post("/stripe/webhook", handleStripeWebhook);

// ===== Protected Routes (Require Authentication) =====

/**
 * @route   POST /api/v1/payments/stripe/create-intent
 * @desc    Create Stripe PaymentIntent
 * @access  Protected
 */
router.post("/stripe/create-intent", protect, createStripeIntent);

/**
 * @route   POST /api/v1/payments/stripe/confirm
 * @desc    Confirm Stripe Payment / Check payment intent status
 * @access  Protected
 */
router.post("/stripe/confirm", protect, confirmStripePayment);

/**
 * @route   POST /api/v1/payments/create-order
 * @desc    Create Razorpay payment order
 * @access  Protected
 */
router.post(
  "/create-order",
  protect,
  validateCreateOrder,
  validate,
  createPaymentOrder
);

/**
 * @route   POST /api/v1/payments/verify
 * @desc    Verify payment signature and complete order
 * @access  Protected
 */
router.post(
  "/verify",
  protect,
  validatePaymentVerification,
  validate,
  verifyPayment
);

/**
 * @route   POST /api/v1/payments/failure
 * @desc    Record payment failure
 * @access  Protected
 */
router.post(
  "/failure",
  protect,
  validatePaymentFailure,
  validate,
  handlePaymentFailure
);

/**
 * @route   GET /api/v1/payments/history
 * @desc    Get user's payment history
 * @access  Protected
 */
router.get(
  "/history",
  protect,
  validatePaymentHistory,
  validate,
  getPaymentHistory
);

/**
 * @route   GET /api/v1/payments/:paymentId/status
 * @desc    Get payment status
 * @access  Protected
 */
router.get(
  "/:paymentId/status",
  protect,
  validatePaymentId,
  validate,
  getPaymentStatus
);

/**
 * @route   POST /api/v1/payments/:paymentId/retry
 * @desc    Retry failed payment
 * @access  Protected
 */
router.post(
  "/:paymentId/retry",
  protect,
  validatePaymentId,
  validate,
  retryPayment
);

// ===== Admin Routes =====

/**
 * @route   POST /api/v1/payments/:paymentId/refund
 * @desc    Initiate refund (Admin only)
 * @access  Protected/Admin
 */
router.post(
  "/:paymentId/refund",
  protect,
  authorize("admin", "super_admin"),
  validateRefund,
  validate,
  initiateRefund
);

module.exports = router;

