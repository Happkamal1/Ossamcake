import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

/**
 * Payment Service - Frontend
 * Handles all payment-related API calls and gateways (Razorpay + Stripe)
 */

class PaymentService {
  constructor() {
    this.razorpayLoaded = false;
    this.razorpayKeyId = null;
    this.stripePublishableKey = null;
  }

  /**
   * Load Razorpay SDK script
   * @returns {Promise<boolean>}
   */
  async loadRazorpayScript() {
    if (this.razorpayLoaded || window.Razorpay) {
      this.razorpayLoaded = true;
      return true;
    }

    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        this.razorpayLoaded = true;
        resolve(true);
      };
      script.onerror = () => {
        console.error("Failed to load Razorpay SDK");
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  /**
   * Get payment configuration status
   * @returns {Promise<Object>}
   */
  async getConfigStatus() {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/config`);
      return response.data;
    } catch (error) {
      console.error("Failed to get payment config:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Get Razorpay Key ID
   * @returns {Promise<string>}
   */
  async getRazorpayKey() {
    try {
      if (this.razorpayKeyId) {
        return this.razorpayKeyId;
      }

      if (import.meta.env.VITE_RAZORPAY_KEY_ID) {
        this.razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
        return this.razorpayKeyId;
      }

      const response = await axios.get(`${API_BASE_URL}/payments/key`);
      this.razorpayKeyId = response.data.data.keyId;
      return this.razorpayKeyId;
    } catch (error) {
      console.error("Failed to get Razorpay key:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Get Stripe Publishable Key
   * @returns {Promise<string>}
   */
  async getStripeKey() {
    try {
      if (this.stripePublishableKey) {
        return this.stripePublishableKey;
      }

      if (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        this.stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        return this.stripePublishableKey;
      }

      const response = await axios.get(`${API_BASE_URL}/payments/stripe/key`);
      this.stripePublishableKey = response.data.data?.publishableKey;
      return this.stripePublishableKey;
    } catch (error) {
      console.error("Failed to get Stripe key:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Create Razorpay payment order
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>}
   */
  async createPaymentOrder(orderId) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/payments/create-order`,
        { orderId },
        {
          withCredentials: true,
          headers: this._getAuthHeaders(),
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to create payment order:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Create Stripe PaymentIntent
   * @param {Object} payload - { orderId, shippingAddress }
   * @returns {Promise<Object>}
   */
  async createStripeIntent(payload) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/payments/stripe/create-intent`,
        payload,
        {
          withCredentials: true,
          headers: this._getAuthHeaders(),
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to create Stripe PaymentIntent:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Confirm Stripe payment / verify status
   * @param {string} paymentIntentId
   * @returns {Promise<Object>}
   */
  async confirmStripePayment(paymentIntentId) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/payments/stripe/confirm`,
        { paymentIntentId },
        {
          withCredentials: true,
          headers: this._getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Stripe payment confirmation failed:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Verify Razorpay payment
   * @param {Object} paymentData - Payment verification data
   * @returns {Promise<Object>}
   */
  async verifyPayment(paymentData) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/payments/verify`,
        paymentData,
        {
          withCredentials: true,
          headers: this._getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Payment verification failed:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Record payment failure
   * @param {Object} failureData - Failure data
   * @returns {Promise<Object>}
   */
  async recordPaymentFailure(failureData) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/payments/failure`,
        failureData,
        {
          withCredentials: true,
          headers: this._getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to record payment failure:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Get payment status
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>}
   */
  async getPaymentStatus(paymentId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/payments/${paymentId}/status`,
        {
          withCredentials: true,
          headers: this._getAuthHeaders(),
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to get payment status:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Get payment history
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>}
   */
  async getPaymentHistory(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}/payments/history${queryParams ? `?${queryParams}` : ""}`;
      
      const response = await axios.get(url, {
        withCredentials: true,
        headers: this._getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error("Failed to get payment history:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Retry failed payment
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>}
   */
  async retryPayment(paymentId) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/payments/${paymentId}/retry`,
        {},
        {
          withCredentials: true,
          headers: this._getAuthHeaders(),
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to retry payment:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Open Razorpay checkout modal with optimized UPI Intent / mobile flow & QR fallback
   * @param {Object} options - Payment options
   * @returns {Promise<Object>}
   */
  async openRazorpay(options) {
    const {
      orderId,
      amount,
      currency = "INR",
      orderNumber,
      userDetails,
      onSuccess,
      onFailure,
      onDismiss,
    } = options;

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await this.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay. Please check your internet connection.");
      }

      // 2. Get Razorpay key
      let keyId;
      try {
        keyId = await this.getRazorpayKey();
      } catch (error) {
        throw new Error(
          "Payment gateway is not configured. Please use Cash on Delivery or contact support."
        );
      }

      // 3. Prepare Razorpay options with UPI Intent / Mobile optimization
      const razorpayOptions = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "OssamCake",
        description: `Order #${orderNumber}`,
        order_id: orderId,
        prefill: {
          name: userDetails?.name || "",
          email: userDetails?.email || "",
          contact: userDetails?.phone || "",
        },
        theme: {
          color: "#db2777", // OssamCake pink
        },
        // Optimize method display: prioritize UPI Intent / Google Pay / PhonePe / Paytm
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI (Google Pay, PhonePe, Paytm, QR)",
                instruments: [
                  {
                    method: "upi",
                  },
                ],
              },
              cards: {
                name: "Cards & Other Methods",
                instruments: [
                  {
                    method: "card",
                  },
                  {
                    method: "netbanking",
                  },
                  {
                    method: "wallet",
                  },
                ],
              },
            },
            sequence: ["block.upi", "block.cards"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        modal: {
          ondismiss: () => {
            if (onDismiss) {
              onDismiss();
            }
          },
        },
        handler: async (response) => {
          try {
            // Payment successful, verify on backend
            const verificationResult = await this.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (onSuccess) {
              onSuccess(verificationResult);
            }
          } catch (error) {
            if (onFailure) {
              onFailure(error);
            }
          }
        },
      };

      // 4. Open Razorpay checkout
      const razorpay = new window.Razorpay(razorpayOptions);

      // Handle payment failure
      razorpay.on("payment.failed", async (response) => {
        const failureData = {
          razorpay_order_id: orderId,
          razorpay_payment_id: response.error?.metadata?.payment_id || "",
          error_code: response.error?.code,
          error_description: response.error?.description,
          error_source: response.error?.source,
          error_step: response.error?.step,
          error_reason: response.error?.reason,
        };

        // Record failure
        await this.recordPaymentFailure(failureData);

        if (onFailure) {
          onFailure(response.error);
        }
      });

      razorpay.open();
    } catch (error) {
      console.error("Razorpay initialization error:", error);
      throw error;
    }
  }

  /**
   * Helper to get auth headers if token exists in localStorage
   * @private
   */
  _getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Handle API errors
   * @private
   */
  _handleError(error) {
    if (error.response) {
      const message = error.response.data?.message || "An error occurred";
      return new Error(message);
    } else if (error.request) {
      return new Error("Network error. Please check your connection.");
    } else {
      return error;
    }
  }
}

// Export singleton instance
const paymentService = new PaymentService();
export default paymentService;
