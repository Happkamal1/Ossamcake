const crypto = require("crypto");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Cake = require("../models/Cake");
const Coupon = require("../models/Coupon");
const ApiError = require("../utils/ApiError");
const razorpayService = require("./razorpay.service");
const stripeService = require("./stripe.service");
const orderService = require("./orderService");

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

      if (order.paymentStatus === "refunded" || order.orderStatus === "refunded") {
        throw new ApiError(400, "Cannot process payment for refunded order");
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

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new ApiError(400, "Missing required payment verification parameters");
    }

    try {
      // 1. Find server payment record by Razorpay order ID
      const payment = await Payment.findOne({
        razorpayOrderId: razorpay_order_id,
      });

      if (!payment) {
        throw new ApiError(404, "Payment record not found");
      }

      // Requirement 1: Verify Payment Ownership
      if (payment.user.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized access to payment");
      }

      // Requirement 2: Find and Verify Associated Order Ownership
      const order = await Order.findById(payment.order);
      if (!order) {
        throw new ApiError(404, "Associated order not found");
      }

      if (order.user.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized access to order");
      }

      // Requirement 3: Validate Razorpay Order ID server integrity
      if (order.razorpayOrderId && order.razorpayOrderId !== razorpay_order_id) {
        throw new ApiError(400, "Payment order ID mismatch with order record");
      }

      // Requirement 4: State machine protection — reject invalid states
      if (order.orderStatus === "cancelled") {
        throw new ApiError(400, "Cannot complete payment for a cancelled order");
      }

      if (order.paymentStatus === "refunded" || payment.status === "refunded" || order.orderStatus === "refunded") {
        throw new ApiError(400, "Cannot process payment on a refunded transaction");
      }

      // Requirement 5: Idempotency check — if already paid/captured, return safely without duplicating stock/cart actions
      if ((payment.signatureVerified && payment.status === "captured") || order.paymentStatus === "paid") {
        return {
          success: true,
          order: order,
          payment: payment,
          message: "Payment already verified",
        };
      }

      // Verify cryptographic signature against backend secret
      const isValid = await razorpayService.verifyPaymentSignature(paymentData);

      if (!isValid) {
        payment.status = "failed";
        payment.errorDescription = "Invalid payment signature";
        payment.errorReason = "signature_verification_failed";
        await payment.save();

        throw new ApiError(400, "Payment verification failed. Invalid signature.");
      }

      // Update payment record
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.signatureVerified = true;
      payment.verifiedAt = new Date();
      payment.status = "captured";
      await payment.save();

      // Requirement 1 & 3: Atomic payment lock for stock deduction
      await this._atomicReduceStock(payment._id, order.items);
      payment.isStockReduced = true;

      // Update order status to paid and confirmed
      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      await order.save();

      // Record coupon usage if applied
      if (order.appliedCoupon) {
        await Coupon.findOneAndUpdate(
          { code: order.appliedCoupon },
          { $inc: { usedCount: 1 } }
        );
      }

      // Clear user's cart
      await Cart.findOneAndUpdate(
        { user: userId },
        { 
          items: [], 
          appliedCoupon: "", 
          couponDiscount: 0 
        }
      );

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

      if (payment) {
        // Ownership check
        if (payment.user.toString() !== userId.toString()) {
          throw new ApiError(403, "Unauthorized access to payment");
        }

        const order = await Order.findById(payment.order);
        if (order && order.user.toString() !== userId.toString()) {
          throw new ApiError(403, "Unauthorized access to order");
        }

        if (payment.status === "captured" || payment.status === "refunded") {
          return {
            success: false,
            message: `Payment cannot be marked failed: current status is ${payment.status}`,
            canRetry: false,
          };
        }

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

        if (order && order.paymentStatus !== "paid") {
          order.paymentStatus = "failed";
          await order.save();
        }
      } else {
        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        
        if (!order) {
          throw new ApiError(404, "Order not found");
        }

        if (order.user.toString() !== userId.toString()) {
          throw new ApiError(403, "Unauthorized access to order");
        }

        if (order.paymentStatus === "paid" || order.orderStatus === "cancelled" || order.paymentStatus === "refunded") {
          return {
            success: false,
            message: `Order cannot be marked failed: current status is ${order.orderStatus}/${order.paymentStatus}`,
            canRetry: false,
          };
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

        order.paymentStatus = "failed";
        await order.save();
      }

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

        case "payment.captured": {
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

          const order = await Order.findById(payment.order);
          if (!order) {
            console.warn(`Order not found for payment: ${payment._id}`);
            break;
          }

          // State Machine Protection: Reject revival of cancelled order
          if (order.orderStatus === "cancelled") {
            console.warn(`Webhook received for cancelled order ${order.orderNumber}. Rejecting revival.`);
            payment.status = "failed";
            payment.errorDescription = "Order was cancelled prior to payment confirmation";
            await payment.save();
            return { received: true, processed: false, reason: "Order is cancelled" };
          }

          // State Machine Protection: Reject payment on refunded transaction
          if (order.paymentStatus === "refunded" || payment.status === "refunded" || order.orderStatus === "refunded") {
            console.warn(`Webhook received for refunded transaction on order ${order.orderNumber}. Rejecting revival.`);
            return { received: true, processed: false, reason: "Transaction is refunded" };
          }

          // Idempotency: Already paid and stock reduced
          if (order.paymentStatus === "paid" && payment.isStockReduced) {
            await payment.save();
            return { received: true, processed: true, duplicate: true };
          }

          // Update order status
          order.paymentStatus = "paid";
          order.orderStatus = "confirmed";
          order.razorpayPaymentId = paymentEntity.id;
          await order.save();

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
          await payment.save();

          // Requirement 1 & 3: Atomic payment lock for stock deduction
          await this._atomicReduceStock(payment._id, order.items);
          payment.isStockReduced = true;

          // Clear user's cart
          await Cart.findOneAndUpdate(
            { user: payment.user },
            { items: [], appliedCoupon: "", couponDiscount: 0 }
          );
          break;
        }

        case "payment.failed": {
          payment.status = "failed";
          payment.razorpayPaymentId = paymentEntity.id;
          payment.errorCode = paymentEntity.error_code;
          payment.errorDescription = paymentEntity.error_description;
          payment.errorSource = paymentEntity.error_source;
          payment.errorReason = paymentEntity.error_reason;

          // Update order status only if not already paid
          const failedOrder = await Order.findById(payment.order);
          if (failedOrder && failedOrder.paymentStatus !== "paid") {
            failedOrder.paymentStatus = "failed";
            await failedOrder.save();
          }
          break;
        }

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
  /**
   * Create Stripe PaymentIntent (Step 1 of Stripe payment flow)
   * @param {String} userId - User ID
   * @param {Object} data - { orderId, shippingAddress }
   * @returns {Object} PaymentIntent details
   */
  async createStripePaymentIntent(userId, data = {}) {
    try {
      const { orderId, shippingAddress } = data;
      let order;

      if (orderId) {
        order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) {
          throw new ApiError(404, "Order not found");
        }
      } else if (shippingAddress) {
        // Place pending order using server-side calculation
        const result = await orderService.placeOrder(userId, {
          shippingAddress,
          paymentMethod: "stripe",
        });
        order = result.order;
      } else {
        throw new ApiError(400, "Order ID or shipping address is required");
      }

      if (order.paymentStatus === "paid") {
        throw new ApiError(400, "Order is already paid");
      }

      if (order.orderStatus === "cancelled") {
        throw new ApiError(400, "Cannot process payment for cancelled order");
      }

      if (order.paymentStatus === "refunded" || order.orderStatus === "refunded") {
        throw new ApiError(400, "Cannot process payment for refunded order");
      }

      // Check if Stripe Payment record already exists for this order
      if (order.stripePaymentIntentId) {
        const existingPayment = await Payment.findOne({
          stripePaymentIntentId: order.stripePaymentIntentId,
        });

        if (
          existingPayment &&
          ["created", "requires_payment_method", "processing"].includes(existingPayment.status) &&
          existingPayment.stripeClientSecret
        ) {
          return {
            clientSecret: existingPayment.stripeClientSecret,
            paymentIntentId: existingPayment.stripePaymentIntentId,
            orderId: order._id,
            orderNumber: order.orderNumber,
            amount: existingPayment.amount,
            currency: existingPayment.currency,
            publishableKey: stripeService.getPublishableKey(),
          };
        }
      }

      // Create new Stripe PaymentIntent via Stripe service
      const stripeIntent = await stripeService.createPaymentIntent({
        amount: order.grandTotal,
        currency: "INR",
        orderId: order._id,
        orderNumber: order.orderNumber,
        metadata: {
          orderId: order._id.toString(),
          userId: userId.toString(),
          orderNumber: order.orderNumber,
        },
      });

      // Create Payment record
      const payment = await Payment.create({
        user: userId,
        order: order._id,
        provider: "stripe",
        stripePaymentIntentId: stripeIntent.id,
        stripeClientSecret: stripeIntent.clientSecret,
        providerPaymentId: stripeIntent.id,
        amount: stripeIntent.amount,
        currency: stripeIntent.currency,
        receipt: order.orderNumber,
        status: "created",
      });

      // Update order
      order.stripePaymentIntentId = stripeIntent.id;
      order.paymentProvider = "stripe";
      order.paymentMethod = "stripe";
      order.paymentTransaction = payment._id;
      await order.save();

      return {
        clientSecret: stripeIntent.clientSecret,
        paymentIntentId: stripeIntent.id,
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: stripeIntent.amount,
        currency: stripeIntent.currency,
        publishableKey: stripeService.getPublishableKey(),
      };
    } catch (error) {
      console.error("Create Stripe PaymentIntent error:", error);
      throw error;
    }
  }

  /**
   * Confirm Stripe payment client-side / status check
   * @param {String} userId - User ID
   * @param {Object} data - { paymentIntentId }
   */
  async confirmStripePayment(userId, data) {
    const { paymentIntentId } = data;
    if (!paymentIntentId) {
      throw new ApiError(400, "PaymentIntent ID is required");
    }

    try {
      const payment = await Payment.findOne({
        stripePaymentIntentId: paymentIntentId,
      });

      if (!payment) {
        throw new ApiError(404, "Payment record not found");
      }

      if (payment.user.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized access to payment");
      }

      // Requirement 2: Verify associated order ownership
      const order = await Order.findById(payment.order);
      if (!order) {
        throw new ApiError(404, "Associated order not found");
      }

      if (order.user.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized access to order");
      }

      // Requirement 4: State machine protection — reject invalid states
      if (order.orderStatus === "cancelled") {
        throw new ApiError(400, "Cannot complete payment for a cancelled order");
      }

      if (order.paymentStatus === "refunded" || payment.status === "refunded" || order.orderStatus === "refunded") {
        throw new ApiError(400, "Cannot process payment on a refunded transaction");
      }

      // Requirement 5: Idempotency: If already confirmed, return order directly
      if (payment.status === "captured" || payment.status === "succeeded" || order.paymentStatus === "paid") {
        return {
          success: true,
          order,
          payment,
          message: "Payment already verified",
        };
      }

      // Retrieve latest state from Stripe
      const intent = await stripeService.fetchPaymentIntent(paymentIntentId);

      if (intent.status === "succeeded") {
        payment.status = "captured";
        payment.signatureVerified = true;
        payment.paidAt = new Date();
        payment.method = intent.payment_method?.type || "card";

        if (intent.payment_method?.card) {
          payment.paymentMetadata = {
            cardNetwork: intent.payment_method.card.brand,
            brand: intent.payment_method.card.brand,
            last4: intent.payment_method.card.last4,
            expMonth: intent.payment_method.card.exp_month,
            expYear: intent.payment_method.card.exp_year,
            funding: intent.payment_method.card.funding,
            country: intent.payment_method.card.country,
          };
        }

        await payment.save();

        if (order) {
          // Requirement 1 & 3: Atomic payment lock for stock deduction
          await this._atomicReduceStock(payment._id, order.items);
          payment.isStockReduced = true;

          order.paymentStatus = "paid";
          order.orderStatus = "confirmed";
          order.paymentProvider = "stripe";
          order.stripePaymentIntentId = paymentIntentId;
          await order.save();

          // Record coupon usage if applied
          if (order.appliedCoupon) {
            await Coupon.findOneAndUpdate(
              { code: order.appliedCoupon },
              { $inc: { usedCount: 1 } }
            );
          }
        }

        // Clear user cart
        await Cart.findOneAndUpdate(
          { user: userId },
          { items: [], appliedCoupon: "", couponDiscount: 0 }
        );

        return {
          success: true,
          order,
          payment,
          message: "Payment verified successfully",
        };
      } else if (intent.status === "processing") {
        payment.status = "processing";
        await payment.save();

        return {
          success: true,
          status: "processing",
          message: "Payment is currently processing",
        };
      } else {
        payment.status = "failed";
        payment.errorDescription = intent.last_payment_error?.message || "Payment not completed";
        await payment.save();

        if (order && order.paymentStatus !== "paid") {
          order.paymentStatus = "failed";
          await order.save();
        }

        throw new ApiError(400, `Payment status: ${intent.status}`);
      }
    } catch (error) {
      console.error("Confirm Stripe payment error:", error);
      throw error;
    }
  }

  /**
   * Handle Stripe Webhook
   * @param {Buffer|String} rawBody - Raw body
   * @param {String} signature - Stripe signature header
   */
  async handleStripeWebhook(rawBody, signature) {
    try {
      const event = stripeService.constructWebhookEvent(rawBody, signature);
      const { type, data } = event;
      const paymentIntent = data?.object;

      if (!paymentIntent) {
        return { received: true, processed: false };
      }

      const payment = await Payment.findOne({
        stripePaymentIntentId: paymentIntent.id,
      });

      if (!payment) {
        console.warn(`Payment record not found for Stripe Intent: ${paymentIntent.id}`);
        return { received: true, processed: false, reason: "Payment record not found" };
      }

      switch (type) {
        case "payment_intent.succeeded": {
          const order = await Order.findById(payment.order);
          if (!order) {
            console.warn(`Order not found for Stripe Intent: ${paymentIntent.id}`);
            return { received: true, processed: false, reason: "Order not found" };
          }

          // State Machine Protection: Reject revival of cancelled order
          if (order.orderStatus === "cancelled") {
            console.warn(`Stripe webhook received for cancelled order ${order.orderNumber}. Rejecting revival.`);
            payment.status = "failed";
            payment.errorDescription = "Order was cancelled prior to payment confirmation";
            await payment.save();
            return { received: true, processed: false, reason: "Order is cancelled" };
          }

          // State Machine Protection: Reject payment on refunded transaction
          if (order.paymentStatus === "refunded" || payment.status === "refunded" || order.orderStatus === "refunded") {
            console.warn(`Stripe webhook received for refunded transaction on order ${order.orderNumber}. Rejecting revival.`);
            return { received: true, processed: false, reason: "Transaction is refunded" };
          }

          // Idempotency check: Already processed
          if ((payment.status === "captured" || order.paymentStatus === "paid") && payment.isStockReduced) {
            return { received: true, processed: true, duplicate: true };
          }

          // Verify amount & currency
          if (paymentIntent.amount_received && payment.amount !== paymentIntent.amount_received) {
            console.error(`Amount mismatch: expected ${payment.amount}, received ${paymentIntent.amount_received}`);
            throw new ApiError(400, "Payment amount mismatch");
          }

          if (paymentIntent.currency && payment.currency.toLowerCase() !== paymentIntent.currency.toLowerCase()) {
            console.error(`Currency mismatch: expected ${payment.currency}, received ${paymentIntent.currency}`);
            throw new ApiError(400, "Payment currency mismatch");
          }

          payment.status = "captured";
          payment.signatureVerified = true;
          payment.paidAt = new Date();
          payment.webhookReceived = true;
          payment.webhookEventId = event.id;
          payment.webhookData = event;
          payment.method = paymentIntent.payment_method_types?.[0] || "card";

          await payment.save();

          // Requirement 1 & 3: Atomic payment lock for stock deduction
          await this._atomicReduceStock(payment._id, order.items);
          payment.isStockReduced = true;

          order.paymentStatus = "paid";
          order.orderStatus = "confirmed";
          order.paymentProvider = "stripe";
          order.stripePaymentIntentId = paymentIntent.id;
          await order.save();

          // Clear cart
          await Cart.findOneAndUpdate(
            { user: payment.user },
            { items: [], appliedCoupon: "", couponDiscount: 0 }
          );

          break;
        }

        case "payment_intent.processing": {
          payment.status = "processing";
          payment.webhookReceived = true;
          payment.webhookEventId = event.id;
          await payment.save();
          break;
        }

        case "payment_intent.payment_failed": {
          payment.status = "failed";
          payment.errorCode = paymentIntent.last_payment_error?.code || "";
          payment.errorDescription = paymentIntent.last_payment_error?.message || "Payment failed";
          payment.webhookReceived = true;
          payment.webhookEventId = event.id;
          await payment.save();

          const failedOrder = await Order.findById(payment.order);
          if (failedOrder && failedOrder.paymentStatus !== "paid") {
            failedOrder.paymentStatus = "failed";
            await failedOrder.save();
          }
          break;
        }

        default:
          console.log(`Unhandled Stripe webhook event: ${type}`);
      }

      return { received: true, processed: true, event: type };
    } catch (error) {
      console.error("Stripe webhook handling error:", error);
      throw error;
    }
  }

  /**
   * Initiate refund (Supports Razorpay and Stripe)
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

      if (!["captured", "succeeded"].includes(payment.status)) {
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

      // STRIPE PROVIDER REFUND
      if (payment.provider === "stripe") {
        const stripeRefund = await stripeService.refundPayment(
          payment.stripePaymentIntentId,
          refundAmount / 100, // convert paise/cents to standard currency unit
          reason
        );

        payment.refund = {
          refundId: stripeRefund.id,
          stripeRefundId: stripeRefund.id,
          amount: refundAmount,
          status: stripeRefund.status === "succeeded" ? "processed" : stripeRefund.status,
          reason: reason,
          initiatedAt: new Date(),
          processedAt: new Date(),
        };
        payment.status = "refunded";
        await payment.save();

        await Order.findByIdAndUpdate(payment.order._id, {
          paymentStatus: "refunded",
        });

        return {
          success: true,
          refund: payment.refund,
          message: "Stripe refund initiated successfully",
        };
      }

      // RAZORPAY PROVIDER REFUND
      const refund = await razorpayService.initiateRefund(
        payment.razorpayPaymentId,
        refundAmount,
        { reason, orderId: payment.order.orderNumber }
      );

      // Update payment record
      payment.refund = {
        refundId: refund.id,
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
        message: "Razorpay refund initiated successfully",
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
        .populate("order", "orderNumber grandTotal orderStatus paymentProvider")
        .sort({ createdAt: -1 })
        .limit(filters.limit || 50);

      return payments;
    } catch (error) {
      console.error("Get payment history error:", error);
      throw error;
    }
  }

  /**
   * Helper: Restore stock for a product variant (compensation rollback)
   * @private
   */
  async _restoreStock(cakeId, flavor, size, quantity) {
    return await orderService.restoreStock(cakeId, flavor, size, quantity);
  }

  /**
   * Helper: Atomically reduce stock for ordered items
   * Enforces stock >= requestedQuantity and avoids negative stock.
   * Throws ApiError if stock is insufficient or reduction fails.
   * @private
   */
  async _reduceStock(items) {
    return await orderService.reduceStock(items);
  }

  /**
   * Helper: Atomically lock payment and reduce stock exactly once
   * Only the execution that transitions isStockReduced from false -> true will reduce stock.
   * Concurrent requests see isStockReduced === true and do NOT reduce stock again.
   * If stock reduction fails, lock is rolled back and error is rethrown.
   * @param {ObjectId|String} paymentId - Payment record ID
   * @param {Array} items - Order items
   * @returns {Boolean} True if this execution locked and reduced stock, false if already reduced
   */
  async _atomicReduceStock(paymentId, items) {
    const lockResult = await Payment.findOneAndUpdate(
      {
        _id: paymentId,
        isStockReduced: false,
      },
      {
        $set: {
          isStockReduced: true,
        },
      },
      {
        returnDocument: "after",
      }
    );

    // If lockResult is null, another concurrent request already acquired the lock and reduced stock.
    if (!lockResult) {
      return false;
    }

    try {
      await this._reduceStock(items);
      return true;
    } catch (stockError) {
      // Failure safety: release lock if reduction failed
      await Payment.findByIdAndUpdate(paymentId, {
        $set: { isStockReduced: false },
      });
      throw stockError;
    }
  }

  /**
   * Check payment configuration status for Razorpay, COD, and Stripe
   */
  getConfigurationStatus() {
    return {
      provider: process.env.PAYMENT_PROVIDER || "razorpay",
      cod: {
        isEnabled: true,
      },
      razorpay: razorpayService.checkConfiguration(),
      stripe: stripeService.checkConfiguration(),
    };
  }

  /**
   * Get Stripe publishable key
   */
  getStripePublishableKey() {
    return stripeService.getPublishableKey();
  }
}

module.exports = new PaymentService();
