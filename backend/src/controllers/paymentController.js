const paymentService = require("../services/paymentService");
const razorpayService = require("../services/razorpay.service");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    Get Razorpay configuration status
 * @route   GET /api/v1/payments/config
 * @access  Public
 */
const getConfigStatus = asyncHandler(async (req, res) => {
  const config = paymentService.getConfigurationStatus();
  
  res.status(200).json(
    new ApiResponse(200, config, "Payment configuration status retrieved")
  );
});

/**
 * @desc    Get Razorpay Key ID for frontend
 * @route   GET /api/v1/payments/key
 * @access  Public
 */
const getRazorpayKey = asyncHandler(async (req, res) => {
  try {
    const keyId = razorpayService.getKeyId();
    
    res.status(200).json(
      new ApiResponse(200, { keyId }, "Razorpay key retrieved successfully")
    );
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw new ApiError(500, "Payment gateway configuration error: Razorpay credentials are missing in production.");
    }
    // If Razorpay not configured, return user-friendly message
    res.status(503).json(
      new ApiResponse(
        503,
        null,
        "Payment gateway is not configured yet. Please contact support or use COD."
      )
    );
  }
});

/**
 * @desc    Create Razorpay payment order
 * @route   POST /api/v1/payments/create-order
 * @access  Protected
 */
const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    throw new ApiError(400, "Order ID is required");
  }

  // Create payment order
  const paymentOrder = await paymentService.createPaymentOrder(
    req.user._id,
    orderId
  );

  res.status(200).json(
    new ApiResponse(200, paymentOrder, "Payment order created successfully")
  );
});

/**
 * @desc    Verify payment signature and complete order
 * @route   POST /api/v1/payments/verify
 * @access  Protected
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing payment verification parameters");
  }

  // Verify payment
  const result = await paymentService.verifyPayment(req.user._id, req.body);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        order: result.order,
        payment: result.payment,
      },
      `Payment verified successfully! Order ${result.order.orderNumber} is confirmed.`
    )
  );
});

/**
 * @desc    Handle payment failure
 * @route   POST /api/v1/payments/failure
 * @access  Protected
 */
const handlePaymentFailure = asyncHandler(async (req, res) => {
  const failureData = req.body;

  if (!failureData.razorpay_order_id) {
    throw new ApiError(400, "Order ID is required");
  }

  // Record failure
  const result = await paymentService.handlePaymentFailure(
    req.user._id,
    failureData
  );

  res.status(200).json(
    new ApiResponse(200, result, "Payment failure recorded")
  );
});

/**
 * @desc    Get payment status
 * @route   GET /api/v1/payments/:paymentId/status
 * @access  Protected
 */
const getPaymentStatus = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await paymentService.getPaymentStatus(paymentId);

  // Verify ownership
  if (payment.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Access denied");
  }

  res.status(200).json(
    new ApiResponse(200, payment, "Payment status retrieved")
  );
});

/**
 * @desc    Get user's payment history
 * @route   GET /api/v1/payments/history
 * @access  Protected
 */
const getPaymentHistory = asyncHandler(async (req, res) => {
  const { status, startDate, endDate, limit } = req.query;

  const filters = {};
  if (status) filters.status = status;
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;
  if (limit) filters.limit = parseInt(limit);

  const payments = await paymentService.getPaymentHistory(
    req.user._id,
    filters
  );

  res.status(200).json(
    new ApiResponse(200, payments, "Payment history retrieved")
  );
});

/**
 * @desc    Handle Razorpay webhook
 * @route   POST /api/v1/payments/webhook
 * @access  Public (but signature verified)
 */
const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];

  if (!signature) {
    throw new ApiError(400, "Missing webhook signature");
  }

  // Handle webhook
  const result = await paymentService.handleWebhook(req.body, signature);

  res.status(200).json(
    new ApiResponse(200, result, "Webhook processed successfully")
  );
});

/**
 * @desc    Initiate refund (Admin only)
 * @route   POST /api/v1/payments/:paymentId/refund
 * @access  Protected/Admin
 */
const initiateRefund = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { amount, reason } = req.body;

  // Initiate refund
  const result = await paymentService.initiateRefund(
    paymentId,
    amount,
    reason || "Refund requested by admin"
  );

  res.status(200).json(
    new ApiResponse(200, result, "Refund initiated successfully")
  );
});

/**
 * @desc    Retry failed payment
 * @route   POST /api/v1/payments/:paymentId/retry
 * @access  Protected
 */
const retryPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  // Get payment details
  const payment = await paymentService.getPaymentStatus(paymentId);

  // Verify ownership
  if (payment.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Access denied");
  }

  // Check if can retry
  if (!payment.canRetry()) {
    throw new ApiError(400, "Maximum retry attempts exceeded");
  }

  // Create new payment order for the same order
  const paymentOrder = await paymentService.createPaymentOrder(
    req.user._id,
    payment.order._id
  );

  res.status(200).json(
    new ApiResponse(200, paymentOrder, "Payment retry initiated")
  );
});

/**
 * @desc    Get Stripe Publishable Key for frontend
 * @route   GET /api/v1/payments/stripe/key
 * @access  Public
 */
const getStripeKey = asyncHandler(async (req, res) => {
  if (process.env.ENABLE_STRIPE !== "true") {
    return res.status(200).json(
      new ApiResponse(200, { publishableKey: "", isEnabled: false }, "Stripe payments are currently disabled")
    );
  }
  const publishableKey = paymentService.getStripePublishableKey();
  res.status(200).json(
    new ApiResponse(200, { publishableKey, isEnabled: true }, "Stripe publishable key retrieved")
  );
});

/**
 * @desc    Create Stripe PaymentIntent
 * @route   POST /api/v1/payments/stripe/create-intent
 * @access  Protected
 */
const createStripeIntent = asyncHandler(async (req, res) => {
  if (process.env.ENABLE_STRIPE !== "true") {
    throw new ApiError(503, "Stripe payments are currently disabled. Please use Razorpay or Cash on Delivery.");
  }

  const result = await paymentService.createStripePaymentIntent(
    req.user._id,
    req.body
  );

  res.status(200).json(
    new ApiResponse(200, result, "Stripe PaymentIntent created successfully")
  );
});

/**
 * @desc    Confirm Stripe Payment / Check verification status
 * @route   POST /api/v1/payments/stripe/confirm
 * @access  Protected
 */
const confirmStripePayment = asyncHandler(async (req, res) => {
  if (process.env.ENABLE_STRIPE !== "true") {
    throw new ApiError(503, "Stripe payments are currently disabled. Please use Razorpay or Cash on Delivery.");
  }

  const result = await paymentService.confirmStripePayment(
    req.user._id,
    req.body
  );

  res.status(200).json(
    new ApiResponse(200, result, "Stripe payment confirmed successfully")
  );
});

/**
 * @desc    Handle Stripe Webhook
 * @route   POST /api/v1/payments/stripe/webhook
 * @access  Public (signature verified internally)
 */
const handleStripeWebhook = asyncHandler(async (req, res) => {
  if (process.env.ENABLE_STRIPE !== "true") {
    return res.status(200).json(
      new ApiResponse(
        200,
        { received: true, processed: false, disabled: true },
        "Stripe webhook processing is currently disabled"
      )
    );
  }

  const signature = req.headers["stripe-signature"];

  if (!signature) {
    throw new ApiError(400, "Missing stripe-signature header");
  }

  const rawBody = req.rawBody || req.body;
  const result = await paymentService.handleStripeWebhook(rawBody, signature);

  res.status(200).json(
    new ApiResponse(200, result, "Stripe webhook processed successfully")
  );
});

module.exports = {
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
};
