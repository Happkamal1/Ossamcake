const crypto = require("crypto");
const ApiError = require("../utils/ApiError");

/**
 * Razorpay Service - Production Ready Implementation
 * 
 * This service handles all Razorpay payment operations.
 * It works in two modes:
 * 1. CONFIGURED MODE: When RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set
 * 2. MOCK MODE: When credentials are not set (for development/testing)
 * 
 * Future Integration Steps:
 * 1. Install razorpay SDK: npm install razorpay
 * 2. Add credentials to .env
 * 3. Uncomment the real Razorpay initialization code below
 * 4. The system will automatically switch to real Razorpay
 */

class RazorpayService {
  constructor() {
    this.isConfigured = false;
    this.razorpayInstance = null;
    this.keyId = process.env.RAZORPAY_KEY_ID;
    this.keySecret = process.env.RAZORPAY_KEY_SECRET;
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    this.initialize();
  }

  /**
   * Initialize Razorpay instance
   * Checks for credentials and initializes accordingly
   */
  initialize() {
    if (this.keyId && this.keySecret) {
      try {
        const Razorpay = require("razorpay");
        this.razorpayInstance = new Razorpay({
          key_id: this.keyId,
          key_secret: this.keySecret,
        });
        
        this.isConfigured = true;
        console.log("✅ Razorpay Service: Configured and ready");
      } catch (error) {
        console.warn("⚠️  Razorpay SDK not installed. Run: npm install razorpay");
        this.isConfigured = false;
      }
    } else {
      console.warn("⚠️  Razorpay credentials not found. Payment system running in MOCK mode.");
      console.warn("   Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env to enable real payments.");
      this.isConfigured = false;
    }
  }

  /**
   * Get Razorpay Key ID for frontend
   */
  getKeyId() {
    if (!this.keyId) {
      throw new ApiError(503, "Razorpay is not configured yet. Please contact support.");
    }
    return this.keyId;
  }

  /**
   * Check if service is configured
   */
  checkConfiguration() {
    return {
      isConfigured: this.isConfigured,
      hasKeyId: !!this.keyId,
      hasKeySecret: !!this.keySecret,
      hasWebhookSecret: !!this.webhookSecret,
    };
  }

  /**
   * Create Razorpay Order
   * @param {Object} orderDetails - Order details
   * @returns {Promise<Object>} Razorpay order object
   */
  async createOrder(orderDetails) {
    const { amount, currency = "INR", receipt, notes = {} } = orderDetails;

    // Validate amount (must be in smallest currency unit - paise for INR)
    const amountInSubunit = Math.round(amount * 100);
    
    if (amountInSubunit < 100) {
      throw new ApiError(400, "Amount must be at least ₹1 (100 paise)");
    }

    // REAL MODE: Use actual Razorpay API
    if (this.isConfigured && this.razorpayInstance) {
      try {
        const options = {
          amount: amountInSubunit,
          currency: currency.toUpperCase(),
          receipt: receipt,
          notes: notes,
          payment_capture: 1, // Auto-capture payment
        };

        const order = await this.razorpayInstance.orders.create(options);
        return order;
      } catch (error) {
        console.error("Razorpay order creation failed:", error);
        throw new ApiError(500, `Payment gateway error: ${error.message}`);
      }
    }

    // MOCK MODE: Generate mock order for testing
    return this._createMockOrder({
      amount: amountInSubunit,
      currency: currency.toUpperCase(),
      receipt,
      notes,
    });
  }

  /**
   * Create mock order (for development without credentials)
   */
  _createMockOrder(options) {
    const mockOrderId = `order_${crypto.randomBytes(14).toString("hex")}`;
    
    return {
      id: mockOrderId,
      entity: "order",
      amount: options.amount,
      amount_paid: 0,
      amount_due: options.amount,
      currency: options.currency,
      receipt: options.receipt,
      status: "created",
      attempts: 0,
      notes: options.notes || {},
      created_at: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Verify payment signature
   * @param {Object} paymentData - Payment verification data
   * @returns {Boolean} True if signature is valid
   */
  async verifyPaymentSignature(paymentData) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new ApiError(400, "Missing payment verification parameters");
    }

    // MOCK MODE: Simulate signature verification
    if (!this.isConfigured) {
      // Allow "test_success" signature for testing success flow
      if (razorpay_signature === "test_success") {
        return true;
      }
      // Fail "test_failure" signature for testing failure flow
      if (razorpay_signature === "test_failure") {
        return false;
      }
      // For any other signature in mock mode, accept it
      return true;
    }

    // REAL MODE: Verify using Razorpay's HMAC signature verification
    try {
      if (!this.keySecret) {
        throw new ApiError(500, "Razorpay key secret not configured");
      }

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", this.keySecret)
        .update(body.toString())
        .digest("hex");

      return expectedSignature === razorpay_signature;
    } catch (error) {
      console.error("Signature verification error:", error);
      throw new ApiError(500, "Signature verification failed");
    }
  }

  /**
   * Fetch payment details from Razorpay
   * @param {String} paymentId - Razorpay payment ID
   */
  async fetchPayment(paymentId) {
    if (this.isConfigured && this.razorpayInstance) {
      try {
        const payment = await this.razorpayInstance.payments.fetch(paymentId);
        return payment;
      } catch (error) {
        console.error("Failed to fetch payment:", error);
        throw new ApiError(500, `Failed to fetch payment: ${error.message}`);
      }
    }

    // Mock mode
    return this._createMockPayment(paymentId);
  }

  /**
   * Create mock payment (for development)
   */
  _createMockPayment(paymentId) {
    return {
      id: paymentId,
      entity: "payment",
      amount: 100000, // 1000 INR in paise
      currency: "INR",
      status: "captured",
      order_id: `order_${crypto.randomBytes(14).toString("hex")}`,
      method: "card",
      captured: true,
      email: "customer@example.com",
      contact: "+919999999999",
      created_at: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Verify webhook signature
   * @param {String} webhookBody - Raw webhook body
   * @param {String} webhookSignature - X-Razorpay-Signature header
   */
  verifyWebhookSignature(webhookBody, webhookSignature) {
    if (!this.isConfigured) {
      // In mock mode, accept all webhooks
      console.warn("⚠️  Mock mode: Webhook signature verification skipped");
      return true;
    }

    if (!this.webhookSecret) {
      throw new ApiError(500, "Webhook secret not configured");
    }

    try {
      const expectedSignature = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(webhookBody)
        .digest("hex");

      return expectedSignature === webhookSignature;
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return false;
    }
  }

  /**
   * Initiate refund
   * @param {String} paymentId - Razorpay payment ID
   * @param {Number} amount - Amount to refund (in smallest currency unit)
   */
  async initiateRefund(paymentId, amount, notes = {}) {
    if (this.isConfigured && this.razorpayInstance) {
      try {
        const refund = await this.razorpayInstance.payments.refund(paymentId, {
          amount: amount,
          notes: notes,
        });
        return refund;
      } catch (error) {
        console.error("Refund initiation failed:", error);
        throw new ApiError(500, `Refund failed: ${error.message}`);
      }
    }

    // Mock mode
    return this._createMockRefund(paymentId, amount);
  }

  /**
   * Create mock refund (for development)
   */
  _createMockRefund(paymentId, amount) {
    return {
      id: `rfnd_${crypto.randomBytes(14).toString("hex")}`,
      entity: "refund",
      amount: amount,
      currency: "INR",
      payment_id: paymentId,
      status: "processed",
      created_at: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Capture authorized payment
   * @param {String} paymentId - Razorpay payment ID
   * @param {Number} amount - Amount to capture
   */
  async capturePayment(paymentId, amount) {
    if (this.isConfigured && this.razorpayInstance) {
      try {
        const payment = await this.razorpayInstance.payments.capture(
          paymentId,
          amount
        );
        return payment;
      } catch (error) {
        console.error("Payment capture failed:", error);
        throw new ApiError(500, `Capture failed: ${error.message}`);
      }
    }

    // Mock mode
    return this._createMockCapture(paymentId, amount);
  }

  /**
   * Create mock capture (for development)
   */
  _createMockCapture(paymentId, amount) {
    return {
      id: paymentId,
      entity: "payment",
      amount: amount,
      currency: "INR",
      status: "captured",
      captured: true,
    };
  }
}

// Export singleton instance
module.exports = new RazorpayService();
