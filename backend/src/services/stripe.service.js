const ApiError = require("../utils/ApiError");

/**
 * Stripe Service - Production Ready Implementation
 * 
 * Handles Stripe payment operations including PaymentIntents, Webhook verification,
 * Refunds, and Payment method retrieval.
 * Works in:
 * 1. CONFIGURED MODE: When STRIPE_SECRET_KEY is set
 * 2. MOCK MODE: When credentials are not set (for standalone dev/testing)
 */
class StripeService {
  constructor() {
    this.isEnabled = process.env.ENABLE_STRIPE === "true";
    this.isConfigured = false;
    this.stripeInstance = null;
    this.secretKey = process.env.STRIPE_SECRET_KEY;
    this.publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    this.initialize();
  }

  /**
   * Initialize Stripe instance
   */
  initialize() {
    if (!this.isEnabled) {
      console.log("ℹ️  Stripe Service: DISABLED (Razorpay active in TEST mode, COD enabled)");
      this.isConfigured = false;
      this.stripeInstance = null;
      return;
    }

    if (this.secretKey && !this.secretKey.includes("Mock")) {
      try {
        const Stripe = require("stripe");
        this.stripeInstance = new Stripe(this.secretKey, {
          apiVersion: "2023-10-16",
        });
        this.isConfigured = true;
        console.log("✅ Stripe Service: Configured and ready");
      } catch (error) {
        console.warn("⚠️  Stripe SDK initialization failed:", error.message);
        this.isConfigured = false;
      }
    } else {
      console.warn("⚠️  Stripe credentials not found or placeholder key present. Stripe service running in MOCK mode.");
      this.isConfigured = false;
    }
  }

  /**
   * Get Stripe Publishable Key for frontend
   */
  getPublishableKey() {
    if (!this.isEnabled) {
      return "";
    }
    return this.publishableKey || "";
  }

  /**
   * Check if Stripe is configured
   */
  checkConfiguration() {
    return {
      isEnabled: this.isEnabled,
      isConfigured: this.isEnabled && this.isConfigured,
      hasSecretKey: this.isEnabled && !!this.secretKey,
      hasPublishableKey: this.isEnabled && !!this.publishableKey,
      hasWebhookSecret: this.isEnabled && !!this.webhookSecret,
    };
  }

  /**
   * Create Stripe PaymentIntent
   * @param {Object} options - Payment details
   * @returns {Promise<Object>} PaymentIntent details
   */
  async createPaymentIntent(options) {
    const {
      amount,
      currency = "INR",
      orderId,
      orderNumber,
      customerEmail,
      metadata = {},
    } = options;

    // Convert amount to smallest currency unit (paise/cents)
    const amountInSubunit = Math.round(amount * 100);

    if (amountInSubunit < 50) {
      throw new ApiError(400, "Amount is too small for processing");
    }

    if (this.isConfigured && this.stripeInstance) {
      try {
        const paymentIntent = await this.stripeInstance.paymentIntents.create({
          amount: amountInSubunit,
          currency: currency.toLowerCase(),
          description: `OssamCake Order #${orderNumber || orderId}`,
          receipt_email: customerEmail || undefined,
          automatic_payment_methods: {
            enabled: true,
          },
          metadata: {
            orderId: orderId?.toString(),
            orderNumber: orderNumber || "",
            ...metadata,
          },
        });

        return {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency.toUpperCase(),
          status: paymentIntent.status,
          publishableKey: this.getPublishableKey(),
        };
      } catch (error) {
        console.error("Stripe createPaymentIntent error:", error);
        throw new ApiError(500, `Stripe Gateway Error: ${error.message}`);
      }
    }

    // Mock Mode for local testing without active Stripe API keys
    const mockId = `pi_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const mockClientSecret = `${mockId}_secret_${Math.random().toString(36).substring(2, 12)}`;
    return {
      id: mockId,
      clientSecret: mockClientSecret,
      amount: amountInSubunit,
      currency: currency.toUpperCase(),
      status: "requires_payment_method",
      publishableKey: this.getPublishableKey() || "pk_test_mock_ossamcake",
    };
  }

  /**
   * Retrieve PaymentIntent from Stripe
   * @param {String} paymentIntentId
   */
  async fetchPaymentIntent(paymentIntentId) {
    if (this.isConfigured && this.stripeInstance) {
      try {
        const paymentIntent = await this.stripeInstance.paymentIntents.retrieve(
          paymentIntentId,
          {
            expand: ["latest_charge", "payment_method"],
          }
        );
        return paymentIntent;
      } catch (error) {
        console.error("Stripe fetchPaymentIntent error:", error);
        throw new ApiError(500, `Failed to retrieve Stripe payment: ${error.message}`);
      }
    }

    // Mock mode
    return {
      id: paymentIntentId,
      amount: 100000,
      currency: "inr",
      status: "succeeded",
      metadata: {},
    };
  }

  /**
   * Construct and verify Stripe Webhook event
   * @param {Buffer|String} rawBody - Raw body buffer or string
   * @param {String} signature - Stripe signature header
   */
  constructWebhookEvent(rawBody, signature) {
    if (!this.isConfigured) {
      // Mock mode verification for testing
      if (signature === "test_mock_stripe_sig") {
        const parsed = typeof rawBody === "string" ? JSON.parse(rawBody) : JSON.parse(rawBody.toString("utf8"));
        return parsed;
      }
    }

    if (!this.stripeInstance) {
      throw new ApiError(500, "Stripe service is not configured");
    }

    if (!this.webhookSecret) {
      throw new ApiError(500, "Stripe Webhook secret not configured in backend .env");
    }

    try {
      const event = this.stripeInstance.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret
      );
      return event;
    } catch (error) {
      console.error("Stripe Webhook Signature Verification Failed:", error.message);
      throw new ApiError(400, `Stripe webhook signature error: ${error.message}`);
    }
  }

  /**
   * Refund Stripe payment
   * @param {String} paymentIntentId
   * @param {Number} amount - Amount in standard currency units or subunit
   * @param {String} reason
   */
  async refundPayment(paymentIntentId, amount = null, reason = "requested_by_customer") {
    if (this.isConfigured && this.stripeInstance) {
      try {
        const refundParams = {
          payment_intent: paymentIntentId,
          reason: reason === "duplicate" || reason === "fraudulent" ? reason : "requested_by_customer",
        };
        if (amount) {
          refundParams.amount = Math.round(amount * 100);
        }
        const refund = await this.stripeInstance.refunds.create(refundParams);
        return refund;
      } catch (error) {
        console.error("Stripe refund error:", error);
        throw new ApiError(500, `Stripe refund failed: ${error.message}`);
      }
    }

    // Mock mode
    return {
      id: `re_mock_${Date.now()}`,
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : 0,
      status: "succeeded",
    };
  }
}

// Export singleton instance
module.exports = new StripeService();
