const crypto = require("crypto");

/**
 * Payment Signature Utility
 * Provides cryptographic functions for payment verification
 */

/**
 * Generate HMAC SHA256 signature
 * @param {String} data - Data to sign
 * @param {String} secret - Secret key
 * @returns {String} Hex signature
 */
const generateSignature = (data, secret) => {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
};

/**
 * Verify Razorpay payment signature
 * @param {Object} params - Verification parameters
 * @returns {Boolean} True if valid
 */
const verifyPaymentSignature = (params) => {
  const { orderId, paymentId, signature, secret } = params;

  if (!orderId || !paymentId || !signature || !secret) {
    throw new Error("Missing required parameters for signature verification");
  }

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = generateSignature(body, secret);

  return expectedSignature === signature;
};

/**
 * Verify webhook signature
 * @param {String} body - Raw webhook body
 * @param {String} signature - Signature from header
 * @param {String} secret - Webhook secret
 * @returns {Boolean} True if valid
 */
const verifyWebhookSignature = (body, signature, secret) => {
  if (!body || !signature || !secret) {
    throw new Error("Missing required parameters for webhook verification");
  }

  const expectedSignature = generateSignature(body, secret);
  return expectedSignature === signature;
};

/**
 * Generate mock signature for testing (DEVELOPMENT ONLY)
 * @param {String} orderId - Order ID
 * @param {String} paymentId - Payment ID
 * @returns {String} Mock signature
 */
const generateMockSignature = (orderId, paymentId) => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Mock signature generation is strictly prohibited in production");
  }
  const mockSecret = "test_secret_key";
  const body = `${orderId}|${paymentId}`;
  return generateSignature(body, mockSecret);
};

/**
 * Constant time string comparison (prevents timing attacks)
 * @param {String} a - First string
 * @param {String} b - Second string
 * @returns {Boolean} True if equal
 */
const constantTimeCompare = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
};

/**
 * Validate payment amount (prevent tampering)
 * @param {Number} expectedAmount - Expected amount
 * @param {Number} receivedAmount - Received amount
 * @param {Number} tolerance - Tolerance in percentage (default 0)
 * @returns {Boolean} True if valid
 */
const validateAmount = (expectedAmount, receivedAmount, tolerance = 0) => {
  if (tolerance === 0) {
    return expectedAmount === receivedAmount;
  }

  const difference = Math.abs(expectedAmount - receivedAmount);
  const maxDifference = (expectedAmount * tolerance) / 100;

  return difference <= maxDifference;
};

/**
 * Generate idempotency key (prevent duplicate transactions)
 * @param {String} orderId - Order ID
 * @param {String} timestamp - Optional timestamp
 * @returns {String} Idempotency key
 */
const generateIdempotencyKey = (orderId, timestamp = Date.now()) => {
  const data = `${orderId}_${timestamp}`;
  return crypto.createHash("sha256").update(data).digest("hex");
};

/**
 * Hash sensitive data (for logging)
 * @param {String} data - Data to hash
 * @returns {String} Hashed data
 */
const hashData = (data) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

module.exports = {
  generateSignature,
  verifyPaymentSignature,
  verifyWebhookSignature,
  generateMockSignature,
  constantTimeCompare,
  validateAmount,
  generateIdempotencyKey,
  hashData,
};
