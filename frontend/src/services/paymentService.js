import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

/**
 * Payment Service - Frontend
 * Handles all payment-related API calls and Razorpay integration
 */

/**
 * Payment Service Class
 */
class PaymentService {
  constructor() {
    this.razorpayLoaded = false;
    this.razorpayKeyId = null;
  }

  /**
   * Load Razorpay SDK script
   * @returns {Promise<boolean>}
   */
  async loadRazorpayScript() {
    if (this.razorpayLoaded) {
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

      const response = await axios.get(`${API_BASE_URL}/payments/key`);
      this.razorpayKeyId = response.data.data.keyId;
      return this.razorpayKeyId;
    } catch (error) {
      console.error("Failed to get Razorpay key:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Create payment order
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>}
   */
  async createPaymentOrder(orderId) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/payments/create-order`,
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${this._getToken()}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to create payment order:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Verify payment
   * @param {Object} paymentData - Payment verification data
   * @returns {Promise<Object>}
   */
  async verifyPayment(paymentData) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/payments/verify`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${this._getToken()}`,
          },
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
          headers: {
            Authorization: `Bearer ${this._getToken()}`,
          },
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
          headers: {
            Authorization: `Bearer ${this._getToken()}`,
          },
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
        headers: {
          Authorization: `Bearer ${this._getToken()}`,
        },
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
          headers: {
            Authorization: `Bearer ${this._getToken()}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to retry payment:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Open Razorpay checkout modal
   * @param {Object} options - Payment options
   * @returns {Promise<Object>}
   */
  async openRazorpay(options) {
    const {
      orderId,
      amount,
      currency,
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
        // If Razorpay not configured, show friendly message
        throw new Error(
          "Payment gateway is not configured. Please use Cash on Delivery or contact support."
        );
      }

      // 3. Prepare Razorpay options
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
          color: "#FF5C8A", // Your primary brand color
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
          razorpay_payment_id: response.error.metadata?.payment_id || "",
          error_code: response.error.code,
          error_description: response.error.description,
          error_source: response.error.source,
          error_step: response.error.step,
          error_reason: response.error.reason,
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
   * Process payment (Complete flow)
   * @param {string} orderId - Order ID from backend
   * @param {Object} userDetails - User information
   * @returns {Promise<Object>}
   */
  async processPayment(orderId, userDetails) {
    try {
      // 1. Create payment order
      const paymentOrder = await this.createPaymentOrder(orderId);

      // 2. Return promise for payment flow
      return new Promise((resolve, reject) => {
        this.openRazorpay({
          orderId: paymentOrder.orderId,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          orderNumber: paymentOrder.orderNumber,
          userDetails,
          onSuccess: (result) => {
            resolve(result);
          },
          onFailure: (error) => {
            reject(error);
          },
          onDismiss: () => {
            reject(new Error("Payment cancelled by user"));
          },
        });
      });
    } catch (error) {
      console.error("Payment processing error:", error);
      throw error;
    }
  }

  /**
   * Get JWT token from localStorage
   * @private
   */
  _getToken() {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }
    return token;
  }

  /**
   * Handle API errors
   * @private
   */
  _handleError(error) {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || "An error occurred";
      return new Error(message);
    } else if (error.request) {
      // Request made but no response
      return new Error("Network error. Please check your connection.");
    } else {
      // Something else happened
      return error;
    }
  }
}

// Export singleton instance
const paymentService = new PaymentService();
export default paymentService;
