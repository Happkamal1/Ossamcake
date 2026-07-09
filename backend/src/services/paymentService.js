const crypto = require("crypto");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Cake = require("../models/Cake");
const ApiError = require("../utils/ApiError");
const razorpayService = require("./razorpay.service");

/**
 * Payment Service - Comprehensive payment management
 * Handles the complete payment lifecycle
 */
class PaymentService {
  /**
   * Create payment order (Step 1 of payment flow)
   * @param {String} userId - User ID
   * @param {String} orderId - Order ID
   * @returns {Object} Payment order details
   */
  async createPaymentOrder(userId, orderId) {
    try {
      // 1. Find and validate order
      const order = await Order.findOne({ _id: orderId, user: userId });
      
      if (!order) {
        throw new ApiError(404, "Order not found");
      }

      if (order.paymentStatus === "paid") {
        throw new ApiError(400, "Order is already paid");
      }

      if (order.orderStatus === "cancelled") {
        throw new ApiError(400, "Cannot process payment for cancelled order");
      }

      // 2. Check if payment order already exists
      if (order.razorpayOrderId) {
        const existingPayment = await Payment.findOne({
          razorpayOrderId: order.razorpayOrderId,
        });

        if (existingPayment && existingPayment.status === "created") {
          // Return existing payment order
          return {
            orderId: existingPayment.razorpayOrderId,
            amount: existingPayment.amount,
            currency: existingPayment.currency,
            receipt: existingPayment.receipt,
            keyId: razorpayService.getKeyId(),
            orderNumber: order.orderNumber,
          };
        }
      }

      // 3. Create new Razorpay order
      const razorpayOrder = await razorpayService.createOrder({
        amount: order.grandTotal,
        currency: "INR",
        receipt: order.orderNumber,
        notes: {
          orderId: order._id.toString(),
          userId: userId.toString(),
          orderNumber: order.orderNumber,
        },
      });

      // 4. Create payment record in database
      const payment = await Payment.create({
        user: userId,
        order: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: "created",
      });

      // 5. Update order with payment order ID
      order.razorpayOrderId = razorpayOrder.id;
      order.paymentTransaction = payment._id;
      await order.save();

      // 6. Return payment order details for frontend
      return {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        keyId: razorpayService.getKeyId(),
        orderNumber: order.orderNumber,
        notes: razorpayOrder.notes,
      };
    } catch (error) {
      console.error("Create payment order error:", error);
      throw error;
    }
  }

  /**
   * Verify payment (Step 2 of payment flow)
   * @param {String} userId - User ID
   * @param {Object} paymentData - Payment verification data
   */
  async verifyPayment(userId, paymentData) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

    try {
      // 1. Find payment record
      const payment = await Payment.findOne({
        razorpayOrderId: razorpay_order_id,
      });

      if (!payment) {
        throw new ApiError(404, "Payment record not found");
      }

      // 2. Check if already verified
      if (payment.signatureVerified && payment.status === "captured") {
        throw new ApiError(400, "Payment already verified");
      }

      // 3. Verify signature
      const isValid = await razorpayService.verifyPaymentSignature(paymentData);

      if (!isValid) {
        // Mark payment as failed
        payment.status = "failed";
        payment.errorDescription = "Invalid payment signature";
        payment.errorReason = "signature_verification_failed";
        await payment.save();

        throw new ApiError(400, "Payment verification failed. Invalid signature.");
      }

      // 4. Update payment record
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.signatureVerified = true;
      payment.verifiedAt = new Date();
      payment.status = "captured";
      await payment.save();

      // 5. Find and update order
      const order = await Order.findById(payment.order);
      
      if (!order) {
        throw new ApiError(404, "Associated order not found");
      }

      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      await order.save();

      // 6. Reduce stock for ordered items
      await this._reduceStock(order.items);

      // 7. Clear user's cart
      await Cart.findOneAndUpdate(
        { user: userId },
        { 
          items: [], 
          appliedCoupon: "", 
          couponDiscount: 0 
        }
      );

      // 8. Return success response
      return {
        success: true,
        order: order,
        payment: payment,
        message: "Payment verified successfully",
      };
    } catch (error) {
      console.error("Payment verification error:", error);
      throw error;
    }
  }

  /**
   * Handle payment failure
   * @param {String} userId - User ID
   * @param {Object} failureData - Failure data
   */
  async handlePaymentFailure(userId, failureData) {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      error_code,
      error_description,
      error_source,
      error_step,
      error_reason,
    } = failureData;

    try {
      // Find payment record
      const payment = await Payment.findOne({
        razorpayOrderId: razorpay_order_id,
      });

      if (!payment) {
        // Create new payment failure record
        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        
        if (!order) {
          throw new ApiError(404, "Order not found");
        }

        await Payment.create({
          user: userId,
          order: order._id,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id || "",
          amount: order.grandTotal * 100,
          currency: "INR",
          receipt: order.orderNumber,
          status: "failed",
          errorCode: error_code,
          errorDescription: error_description,
          errorSource: error_source,
          errorStep: error_step,
          errorReason: error_reason,
        });
      } else {
        // Update existing payment record
        payment.status = "failed";
        payment.razorpayPaymentId = razorpay_payment_id || payment.razorpayPaymentId;
        payment.errorCode = error_code;
        payment.errorDescription = error_description;
        payment.errorSource = error_source;
        payment.errorStep = error_step;
        payment.errorReason = error_reason;
        payment.attemptCount += 1;
        await payment.save();
      }

      // Update order payment status
      await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { paymentStatus: "failed" }
      );

      return {
        success: false,
        message: "Payment failure recorded",
        canRetry: payment ? payment.canRetry() : true,
      };
    } catch (error) {
      console.error("Handle payment failure error:", error);
      throw error;
    }
  }

  /**
   * Get payment status
   * @param {String} paymentId - Payment ID or Razorpay Order ID
   */
  async getPaymentStatus(paymentId) {
    try {
      const payment = await Payment.findOne({
        $or: [
          { _id: paymentId },
          { razorpayOrderId: paymentId },
          { razorpayPaymentId: paymentId },
        ],
      }).populate("order", "orderNumber grandTotal orderStatus");

      if (!payment) {
        throw new ApiError(404, "Payment not found");
      }

      return payment;
    } catch (error) {
      console.error("Get payment status error:", error);
      throw error;
    }
  }

  /**
   * Handle Razorpay webhook
   * @param {Object} webhookData - Webhook payload
   * @param {String} signature - Webhook signature
   */
  async handleWebhook(webhookData, signature) {
    try {
      // 1. Verify webhook signature
      const webhookBody = JSON.stringify(webhookData);
      const isValid = razorpayService.verifyWebhookSignature(webhookBody, signature);

      if (!isValid) {
        throw new ApiError(400, "Invalid webhook signature");
      }

      // 2. Extract event data
      const { event, payload } = webhookData;
      const paymentEntity = payload?.payment?.entity;

      if (!paymentEntity) {
        throw new ApiError(400, "Invalid webhook payload");
      }

      // 3. Find payment record
      const payment = await Payment.findOne({
        razorpayOrderId: paymentEntity.order_id,
      });

      if (!payment) {
        console.warn(`Payment not found for order: ${paymentEntity.order_id}`);
        return { received: true, processed: false };
      }

      // 4. Update payment based on event type
      payment.webhookReceived = true;
      payment.webhookData = webhookData;

      switch (event) {
        case "payment.authorized":
          payment.status = "authorized";
          payment.razorpayPaymentId = paymentEntity.id;
          break;

        case "payment.captured":
          payment.status = "captured";
          payment.razorpayPaymentId = paymentEntity.id;
          payment.method = paymentEntity.method;
          payment.paymentMetadata = {
            email: paymentEntity.email,
            contact: paymentEntity.contact,
            bank: paymentEntity.bank,
            wallet: paymentEntity.wallet,
            vpa: paymentEntity.vpa,
          };

          // Update order status
          await Order.findByIdAndUpdate(payment.order, {
            paymentStatus: "paid",
            orderStatus: "confirmed",
            razorpayPaymentId: paymentEntity.id,
          });
          break;

        case "payment.failed":
          payment.status = "failed";
          payment.razorpayPaymentId = paymentEntity.id;
          payment.errorCode = paymentEntity.error_code;
          payment.errorDescription = paymentEntity.error_description;
          payment.errorSource = paymentEntity.error_source;
          payment.errorReason = paymentEntity.error_reason;

          // Update order status
          await Order.findByIdAndUpdate(payment.order, {
            paymentStatus: "failed",
          });
          break;

        default:
          console.log(`Unhandled webhook event: ${event}`);
      }

      await payment.save();

      return { received: true, processed: true, event };
    } catch (error) {
      console.error("Webhook handling error:", error);
      throw error;
    }
  }

  /**
   * Initiate refund
   * @param {String} paymentId - Payment ID
   * @param {Number} amount - Refund amount (optional, full refund if not provided)
   * @param {String} reason - Refund reason
   */
  async initiateRefund(paymentId, amount = null, reason = "") {
    try {
      const payment = await Payment.findById(paymentId).populate("order");

      if (!payment) {
        throw new ApiError(404, "Payment not found");
      }

      if (payment.status !== "captured") {
        throw new ApiError(400, "Can only refund captured payments");
      }

      if (payment.refund && payment.refund.status === "processed") {
        throw new ApiError(400, "Payment already refunded");
      }

      // Use full amount if not specified
      const refundAmount = amount || payment.amount;

      if (refundAmount > payment.amount) {
        throw new ApiError(400, "Refund amount cannot exceed payment amount");
      }

      // Initiate refund via Razorpay
      const refund = await razorpayService.initiateRefund(
        payment.razorpayPaymentId,
        refundAmount,
        { reason, orderId: payment.order.orderNumber }
      );

      // Update payment record
      payment.refund = {
        razorpayRefundId: refund.id,
        amount: refundAmount,
        status: refund.status,
        reason: reason,
        initiatedAt: new Date(),
        processedAt: refund.status === "processed" ? new Date() : null,
      };
      payment.status = "refunded";
      await payment.save();

      // Update order
      await Order.findByIdAndUpdate(payment.order._id, {
        paymentStatus: "refunded",
      });

      return {
        success: true,
        refund: payment.refund,
        message: "Refund initiated successfully",
      };
    } catch (error) {
      console.error("Refund initiation error:", error);
      throw error;
    }
  }

  /**
   * Get user's payment history
   * @param {String} userId - User ID
   * @param {Object} filters - Optional filters
   */
  async getPaymentHistory(userId, filters = {}) {
    try {
      const query = { user: userId };

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.startDate && filters.endDate) {
        query.createdAt = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate),
        };
      }

      const payments = await Payment.find(query)
        .populate("order", "orderNumber grandTotal orderStatus")
        .sort({ createdAt: -1 })
        .limit(filters.limit || 50);

      return payments;
    } catch (error) {
      console.error("Get payment history error:", error);
      throw error;
    }
  }

  /**
   * Helper: Reduce stock for ordered items
   * @private
   */
  async _reduceStock(items) {
    try {
      for (const item of items) {
        if (!item.cake) continue;

        const cake = await Cake.findById(item.cake);
        if (!cake) {
          console.warn(`Cake not found: ${item.cake}`);
          continue;
        }

        // Find matching variant
        const variant = cake.variants.find(
          (v) => v.flavor === item.flavor && v.size === item.size
        );

        if (variant) {
          variant.stock = Math.max(0, variant.stock - item.quantity);
          await cake.save();
        }
      }
    } catch (error) {
      console.error("Reduce stock error:", error);
      // Don't throw error - stock reduction failure shouldn't break payment flow
    }
  }

  /**
   * Check Razorpay configuration status
   */
  getConfigurationStatus() {
    return razorpayService.checkConfiguration();
  }
}

module.exports = new PaymentService();
