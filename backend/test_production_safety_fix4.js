require("dotenv").config();
const mongoose = require("mongoose");
const crypto = require("crypto");
const assert = require("assert");
const RazorpayServiceClass = require("./src/services/razorpay.service").constructor;
const paymentService = require("./src/services/paymentService");
const razorpayService = require("./src/services/razorpay.service");
const stripeService = require("./src/services/stripe.service");
const paymentController = require("./src/controllers/paymentController");
const orderService = require("./src/services/orderService");
const cartService = require("./src/services/cartService");
const { generateMockSignature } = require("./src/utils/paymentSignature");
const User = require("./src/models/User");
const Cake = require("./src/models/Cake");
const Cart = require("./src/models/Cart");
const Order = require("./src/models/Order");
const Payment = require("./src/models/Payment");

async function runProductionSafetyTests() {
  console.log("==================================================================");
  console.log("🔒 OSSAMCAKE PAYMENT SAFETY FIX #4: PRODUCTION HARD-BLOCK AUDIT");
  console.log("==================================================================");

  let passed = 0;
  let total = 0;

  function record(name, condition, details = "") {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✅ PASS: ${name}${details ? ` (${details})` : ""}`);
    } else {
      console.error(`  ❌ FAIL: ${name}${details ? ` (${details})` : ""}`);
    }
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  const originalEnv = process.env.NODE_ENV;
  const originalKeyId = razorpayService.keyId;
  const originalKeySecret = razorpayService.keySecret;
  const originalConfigured = razorpayService.isConfigured;
  const originalInstance = razorpayService.razorpayInstance;

  try {
    // -------------------------------------------------------------------------
    // TEST A: Production + missing Razorpay credentials → payment must fail safely
    // -------------------------------------------------------------------------
    console.log("👉 TEST A: Production + Missing Razorpay Credentials (HARD BLOCK)");
    process.env.NODE_ENV = "production";
    razorpayService.keyId = undefined;
    razorpayService.keySecret = undefined;
    razorpayService.isConfigured = false;
    razorpayService.razorpayInstance = null;

    // 1. getKeyId must throw in production
    let getKeyIdFailed = false;
    try {
      razorpayService.getKeyId();
    } catch (err) {
      getKeyIdFailed = err.statusCode === 500;
    }
    record("getKeyId throws HTTP 500 when credentials missing in production", getKeyIdFailed);

    // 2. createOrder must throw 500 (no mock order)
    let createOrderFailed = false;
    try {
      await razorpayService.createOrder({ amount: 500, receipt: "ORD-MOCK-TEST" });
    } catch (err) {
      createOrderFailed = err.statusCode === 500;
    }
    record("createOrder throws HTTP 500 (no mock order created in production)", createOrderFailed);

    // 3. _createMockOrder must throw 500
    let mockOrderDirectFailed = false;
    try {
      razorpayService._createMockOrder({ amount: 50000 });
    } catch (err) {
      mockOrderDirectFailed = err.statusCode === 500;
    }
    record("_createMockOrder throws HTTP 500 in production", mockOrderDirectFailed);

    // 4. verifyPaymentSignature must throw 500 (no mock signature bypass)
    let verifySigFailed = false;
    try {
      await razorpayService.verifyPaymentSignature({
        razorpay_order_id: "order_123",
        razorpay_payment_id: "pay_123",
        razorpay_signature: "test_success",
      });
    } catch (err) {
      verifySigFailed = err.statusCode === 500;
    }
    record("verifyPaymentSignature throws HTTP 500 (mock 'test_success' hard-blocked)", verifySigFailed);

    // 5. _createMockPayment must throw 500
    let mockPaymentDirectFailed = false;
    try {
      razorpayService._createMockPayment("pay_123");
    } catch (err) {
      mockPaymentDirectFailed = err.statusCode === 500;
    }
    record("_createMockPayment throws HTTP 500 in production", mockPaymentDirectFailed);

    // 6. verifyWebhookSignature must return false in production
    const webhookSigResult = razorpayService.verifyWebhookSignature("{}", "sig_123");
    record("verifyWebhookSignature returns false when unconfigured in production", webhookSigResult === false);

    // 7. generateMockSignature must throw in production
    let genMockSigFailed = false;
    try {
      generateMockSignature("order_123", "pay_123");
    } catch (err) {
      genMockSigFailed = err.message.includes("strictly prohibited");
    }
    record("generateMockSignature throws Error in production", genMockSigFailed);

    // 8. capturePayment and initiateRefund throw in production
    let captureFailed = false;
    try {
      await razorpayService.capturePayment("pay_123", 50000);
    } catch (err) {
      captureFailed = err.statusCode === 500;
    }
    record("capturePayment throws HTTP 500 in production when unconfigured", captureFailed);

    let refundFailed = false;
    try {
      await razorpayService.initiateRefund("pay_123", 50000);
    } catch (err) {
      refundFailed = err.statusCode === 500;
    }
    record("initiateRefund throws HTTP 500 in production when unconfigured", refundFailed);

    console.log();

    // -------------------------------------------------------------------------
    // TEST B: Production + Razorpay SDK/API failure → payment must fail safely
    // -------------------------------------------------------------------------
    console.log("👉 TEST B: Production + Razorpay SDK/API Failure (Fail Safely)");
    razorpayService.keyId = originalKeyId;
    razorpayService.keySecret = originalKeySecret;
    razorpayService.isConfigured = true;
    
    // Simulate failing SDK instance
    razorpayService.razorpayInstance = {
      orders: {
        create: async () => {
          throw new Error("Razorpay Gateway 504 Gateway Timeout / Network Down");
        },
      },
    };

    let sdkFailHandled = false;
    let sdkFailMessage = "";
    try {
      await razorpayService.createOrder({ amount: 500, receipt: "ORD-FAIL-TEST" });
    } catch (err) {
      sdkFailHandled = err.statusCode === 500;
      sdkFailMessage = err.message;
    }
    record("Razorpay SDK failure throws HTTP 500 without falling back to mock", sdkFailHandled, sdkFailMessage);

    console.log();

    // -------------------------------------------------------------------------
    // TEST C: Production + Invalid Signature → Payment Rejected
    // -------------------------------------------------------------------------
    console.log("👉 TEST C: Production + Invalid Signature Rejected");
    razorpayService.initialize(); // Restore real Razorpay instance with test keys

    const testUserC = await User.create({
      name: "Prod Audit User C",
      email: `prod_c_${Date.now()}@test.com`,
      password: "Password123!",
    });

    const testCakeC = await Cake.create({
      name: "Prod Audit Cake C",
      slug: `prod-audit-cake-c-${Date.now()}`,
      basePrice: 600,
      price: 600,
      variants: [{ flavor: "Vanilla", size: "1 kg", stock: 10, price: 600 }],
    });

    const orderC = await Order.create({
      user: testUserC._id,
      orderNumber: `ORD_PROD_C_${Date.now()}`,
      items: [{
        cake: testCakeC._id,
        name: testCakeC.name,
        flavor: "Vanilla",
        size: "1 kg",
        quantity: 1,
        unitPrice: 600,
      }],
      shippingAddress: { name: "Tester C", phone: "9876543210", street: "St", city: "City", zip: "400001" },
      paymentMethod: "razorpay",
      subtotal: 600,
      grandTotal: 600,
      orderStatus: "pending",
      paymentStatus: "pending",
      razorpayOrderId: `order_c_${Date.now()}`,
    });

    const paymentC = await Payment.create({
      user: testUserC._id,
      order: orderC._id,
      razorpayOrderId: orderC.razorpayOrderId,
      amount: 60000,
      currency: "INR",
      receipt: orderC.orderNumber,
      status: "created",
    });

    // 1. Invalid signature
    let invalidSigRejected = false;
    try {
      await paymentService.verifyPayment(testUserC._id, {
        razorpay_order_id: orderC.razorpayOrderId,
        razorpay_payment_id: "pay_test_invalid",
        razorpay_signature: "tampered_fake_signature_hex_12345",
      });
    } catch (err) {
      invalidSigRejected = err.statusCode === 400 && err.message.includes("Invalid signature");
    }
    record("Tampered signature rejected with HTTP 400 in production", invalidSigRejected);

    // 2. Mock signature string "test_success" in production
    let testSuccessRejected = false;
    try {
      await paymentService.verifyPayment(testUserC._id, {
        razorpay_order_id: orderC.razorpayOrderId,
        razorpay_payment_id: "pay_test_mock",
        razorpay_signature: "test_success",
      });
    } catch (err) {
      testSuccessRejected = err.statusCode === 400;
    }
    record("'test_success' mock signature rejected with HTTP 400 in production", testSuccessRejected);

    const refreshedOrderC = await Order.findById(orderC._id);
    const refreshedPaymentC = await Payment.findById(paymentC._id);
    record("Order paymentStatus remains NOT paid after invalid signatures", refreshedOrderC.paymentStatus === "pending");
    record("Payment status updated to failed", refreshedPaymentC.status === "failed");

    console.log();

    // -------------------------------------------------------------------------
    // TEST D: Production + Valid Razorpay Verification → Payment Succeeds
    // -------------------------------------------------------------------------
    console.log("👉 TEST D: Production + Genuine Razorpay Verification (HMAC SHA256)");
    const validPaymentId = `pay_real_test_${Date.now()}`;
    const hmac = crypto.createHmac("sha256", razorpayService.keySecret);
    hmac.update(`${orderC.razorpayOrderId}|${validPaymentId}`);
    const genuineSignature = hmac.digest("hex");

    const verifySuccessRes = await paymentService.verifyPayment(testUserC._id, {
      razorpay_order_id: orderC.razorpayOrderId,
      razorpay_payment_id: validPaymentId,
      razorpay_signature: genuineSignature,
    });

    record("Genuine cryptographic verification returns success: true", verifySuccessRes.success === true);
    const orderAfterPaid = await Order.findById(orderC._id);
    const paymentAfterPaid = await Payment.findById(paymentC._id);
    record("Order paymentStatus updated to 'paid'", orderAfterPaid.paymentStatus === "paid");
    record("Order orderStatus updated to 'confirmed'", orderAfterPaid.orderStatus === "confirmed");
    record("Payment status updated to 'captured'", paymentAfterPaid.status === "captured");
    record("Payment signatureVerified is true", paymentAfterPaid.signatureVerified === true);

    const cakeAfterPaid = await Cake.findById(testCakeC._id);
    record("Stock atomically reduced by 1 (10 -> 9)", cakeAfterPaid.variants[0].stock === 9);

    console.log();

    // -------------------------------------------------------------------------
    // TEST E: Cash on Delivery (COD) functionality unchanged
    // -------------------------------------------------------------------------
    console.log("👉 TEST E: Cash on Delivery (COD) Flow & Stock Verification");
    await cartService.addItemToCart(testUserC._id, {
      cakeId: testCakeC._id,
      flavor: "Vanilla",
      size: "1 kg",
      quantity: 1,
    });

    const codPlacement = await orderService.placeOrder(testUserC._id, {
      shippingAddress: { name: "COD Prod", phone: "9876543210", street: "St", city: "City", zip: "400001" },
      paymentMethod: "cod",
    });

    record("COD order confirmed immediately in production", codPlacement.order.orderStatus === "confirmed");
    record("COD paymentStatus is pending", codPlacement.order.paymentStatus === "pending");
    record("COD paymentMethod is 'cod'", codPlacement.order.paymentMethod === "cod");

    const cakeAfterCod = await Cake.findById(testCakeC._id);
    record("Stock atomically decremented by 1 for COD (9 -> 8)", cakeAfterCod.variants[0].stock === 8);

    const userCartAfterCod = await Cart.findOne({ user: testUserC._id });
    record("User cart cleared upon COD order placement", userCartAfterCod.items.length === 0);

    console.log();

    // -------------------------------------------------------------------------
    // TEST F: Stripe Remains Disabled
    // -------------------------------------------------------------------------
    console.log("👉 TEST F: Stripe Remains Completely Disabled");
    record("ENABLE_STRIPE is false in process.env", process.env.ENABLE_STRIPE === "false");
    
    let stripeCreate503 = false;
    await paymentController.createStripeIntent(
      { user: { _id: testUserC._id }, body: {} },
      {},
      (err) => { stripeCreate503 = err?.statusCode === 503; }
    );
    record("createStripeIntent blocked with HTTP 503", stripeCreate503);

    let stripeConfirm503 = false;
    await paymentController.confirmStripePayment(
      { user: { _id: testUserC._id }, body: {} },
      {},
      (err) => { stripeConfirm503 = err?.statusCode === 503; }
    );
    record("confirmStripePayment blocked with HTTP 503", stripeConfirm503);

    let stripeKeyDisabled = false;
    await paymentController.getStripeKey(
      {},
      { status: (code) => ({ json: (data) => { stripeKeyDisabled = data.data?.isEnabled === false; } }) },
      () => {}
    );
    record("getStripeKey returns isEnabled: false", stripeKeyDisabled);

    let stripeWebhookDisabled = false;
    await paymentController.handleStripeWebhook(
      { headers: {} },
      { status: (code) => ({ json: (data) => { stripeWebhookDisabled = data.data?.disabled === true; } }) },
      () => {}
    );
    record("handleStripeWebhook returns disabled: true without processing", stripeWebhookDisabled);

    // Cleanup
    await User.findByIdAndDelete(testUserC._id);
    await Cake.findByIdAndDelete(testCakeC._id);
    await Order.findByIdAndDelete(orderC._id);
    await Order.findByIdAndDelete(codPlacement.order._id);
    await Payment.deleteMany({ user: testUserC._id });
    await Cart.deleteOne({ user: testUserC._id });

  } finally {
    // Restore environment
    process.env.NODE_ENV = originalEnv;
    razorpayService.keyId = originalKeyId;
    razorpayService.keySecret = originalKeySecret;
    razorpayService.isConfigured = originalConfigured;
    razorpayService.razorpayInstance = originalInstance;
    await mongoose.disconnect();
  }

  console.log("\n==================================================================");
  console.log(`🎯 PRODUCTION SAFETY AUDIT RESULTS: ${passed}/${total} PASSED`);
  console.log("==================================================================");

  if (passed === total) {
    console.log("🎉 ALL PRODUCTION SAFETY CHECKS PASSED WITH ZERO VULNERABILITIES!");
    process.exit(0);
  } else {
    console.error("❌ Some production safety checks failed!");
    process.exit(1);
  }
}

runProductionSafetyTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
