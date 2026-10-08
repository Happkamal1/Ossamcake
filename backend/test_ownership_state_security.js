const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("dotenv").config({ path: path.resolve(__dirname, "src/../.env") });
require("dotenv").config();
const mongoose = require("mongoose");
const crypto = require("crypto");
const Cart = require("./src/models/Cart");
const Cake = require("./src/models/Cake");
const User = require("./src/models/User");
const Order = require("./src/models/Order");
const Payment = require("./src/models/Payment");
const paymentService = require("./src/services/paymentService");
const orderService = require("./src/services/orderService");
const razorpayService = require("./src/services/razorpay.service");

async function runOwnershipAndStateSecurityTests() {
  console.log("==================================================================");
  console.log("🔒 OSSAMCAKE PAYMENT SECURITY FIX #2: OWNERSHIP & STATE TEST SUITE");
  console.log("==================================================================\n");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      throw new Error(`Test assertion failed: ${message}`);
    }
  }

  // 1. Setup Test Users
  let userA = await User.findOne({ email: "user_a_sec@ossamcake.com" });
  if (!userA) {
    userA = await User.create({
      name: "User Alpha",
      email: "user_a_sec@ossamcake.com",
      password: "Password123!",
      mobileNumber: "9111111111",
    });
  }

  let userB = await User.findOne({ email: "user_b_sec@ossamcake.com" });
  if (!userB) {
    userB = await User.create({
      name: "User Beta",
      email: "user_b_sec@ossamcake.com",
      password: "Password123!",
      mobileNumber: "9222222222",
    });
  }

  // 2. Setup Test Cake with known stock
  let testCake = await Cake.findOne({ slug: "sec-ownership-test-cake" });
  if (!testCake) {
    testCake = await Cake.create({
      name: "Sec Ownership Test Cake",
      slug: "sec-ownership-test-cake",
      basePrice: 500,
      discount: 0,
      status: "active",
      variants: [
        { flavor: "Chocolate", size: "1 kg", price: 500, stock: 50, status: "active" },
      ],
    });
  } else {
    testCake.variants[0].stock = 50;
    await testCake.save();
  }

  const initialStock = 50;
  testCake.variants[0].stock = initialStock;
  await testCake.save();

  const standardAddress = {
    name: "Test User",
    phone: "9111111111",
    street: "123 Security Lane",
    city: "New Delhi",
    state: "Delhi",
    zip: "110001",
  };

  // Helper to generate legitimate HMAC signature for Razorpay
  function generateValidRazorpaySignature(orderId, paymentId) {
    const secret = process.env.RAZORPAY_KEY_SECRET || "3Osa2FhJdFC4TyeMePZl6vMG";
    const body = orderId + "|" + paymentId;
    return crypto.createHmac("sha256", secret).update(body).digest("hex");
  }

  // Helper to generate Razorpay Webhook signature
  function generateValidWebhookSignature(payloadObj) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "cake_webhook_secret_test_123";
    const body = JSON.stringify(payloadObj);
    return crypto.createHmac("sha256", secret).update(body).digest("hex");
  }

  // -------------------------------------------------------------
  // TEST 1: User A verifies own Razorpay payment → PASS
  // -------------------------------------------------------------
  console.log("👉 TEST 1: User A verifies own Razorpay payment (Legitimate Flow)");
  {
    const order1 = await Order.create({
      user: userA._id,
      items: [
        {
          cake: testCake._id,
          name: testCake.name,
          flavor: "Chocolate",
          size: "1 kg",
          quantity: 1,
          unitPrice: 500,
          discount: 0,
        },
      ],
      shippingAddress: standardAddress,
      subtotal: 500,
      deliveryCharge: 0,
      grandTotal: 500,
      paymentMethod: "razorpay",
      orderStatus: "pending",
      paymentStatus: "pending",
      orderNumber: "ORD_SEC_T1_" + Date.now(),
      razorpayOrderId: "order_mock_t1_" + Date.now(),
    });

    const payment1 = await Payment.create({
      user: userA._id,
      order: order1._id,
      razorpayOrderId: order1.razorpayOrderId,
      amount: 50000,
      currency: "INR",
      receipt: order1.orderNumber,
      status: "created",
    });

    const mockPaymentId = "pay_mock_t1_" + Date.now();
    const validSignature = generateValidRazorpaySignature(order1.razorpayOrderId, mockPaymentId);

    const result = await paymentService.verifyPayment(userA._id, {
      razorpay_order_id: order1.razorpayOrderId,
      razorpay_payment_id: mockPaymentId,
      razorpay_signature: validSignature,
    });

    assert(result.success === true, "Verification returned success: true");
    const updatedOrder1 = await Order.findById(order1._id);
    const updatedPayment1 = await Payment.findById(payment1._id);
    assert(updatedOrder1.paymentStatus === "paid", "Order paymentStatus updated to paid");
    assert(updatedOrder1.orderStatus === "confirmed", "Order orderStatus updated to confirmed");
    assert(updatedPayment1.status === "captured", "Payment status updated to captured");
    assert(updatedPayment1.signatureVerified === true, "Payment signatureVerified is true");

    const refreshedCake = await Cake.findById(testCake._id);
    assert(refreshedCake.variants[0].stock === initialStock - 1, `Stock reduced by 1 (expected ${initialStock - 1}, got ${refreshedCake.variants[0].stock})`);
  }
  console.log();

  // -------------------------------------------------------------
  // TEST 2: User A attempts to verify User B's payment → 403 Forbidden
  // -------------------------------------------------------------
  console.log("👉 TEST 2: User A attempts User B payment verification → HTTP 403 Forbidden");
  {
    const order2 = await Order.create({
      user: userB._id, // Belongs to User B
      items: [
        {
          cake: testCake._id,
          name: testCake.name,
          flavor: "Chocolate",
          size: "1 kg",
          quantity: 1,
          unitPrice: 500,
          discount: 0,
        },
      ],
      shippingAddress: standardAddress,
      subtotal: 500,
      deliveryCharge: 0,
      grandTotal: 500,
      paymentMethod: "razorpay",
      orderStatus: "pending",
      paymentStatus: "pending",
      orderNumber: "ORD_SEC_T2_" + Date.now(),
      razorpayOrderId: "order_mock_t2_" + Date.now(),
    });

    const payment2 = await Payment.create({
      user: userB._id, // Belongs to User B
      order: order2._id,
      razorpayOrderId: order2.razorpayOrderId,
      amount: 50000,
      currency: "INR",
      receipt: order2.orderNumber,
      status: "created",
    });

    const mockPaymentId2 = "pay_mock_t2_" + Date.now();
    const validSigForUserB = generateValidRazorpaySignature(order2.razorpayOrderId, mockPaymentId2);

    let errorThrown = null;
    try {
      // User A (attacker) tries to verify User B's payment!
      await paymentService.verifyPayment(userA._id, {
        razorpay_order_id: order2.razorpayOrderId,
        razorpay_payment_id: mockPaymentId2,
        razorpay_signature: validSigForUserB,
      });
    } catch (err) {
      errorThrown = err;
    }

    assert(errorThrown !== null, "Verification was blocked with an exception");
    assert(errorThrown.statusCode === 403, `HTTP status code is 403 (got ${errorThrown?.statusCode})`);
    assert(errorThrown.message === "Unauthorized access to payment", `Error message is 'Unauthorized access to payment' (got '${errorThrown?.message}')`);

    const order2After = await Order.findById(order2._id);
    const payment2After = await Payment.findById(payment2._id);
    assert(order2After.paymentStatus === "pending", "User B's order remains pending (not corrupted)");
    assert(payment2After.status === "created", "User B's payment remains created (not corrupted)");
  }
  console.log();

  // -------------------------------------------------------------
  // TEST 3: Invalid Razorpay signature → rejected
  // -------------------------------------------------------------
  console.log("👉 TEST 3: Invalid Razorpay signature → rejected (HTTP 400)");
  {
    const order3 = await Order.create({
      user: userA._id,
      items: [
        {
          cake: testCake._id,
          name: testCake.name,
          flavor: "Chocolate",
          size: "1 kg",
          quantity: 1,
          unitPrice: 500,
          discount: 0,
        },
      ],
      shippingAddress: standardAddress,
      subtotal: 500,
      deliveryCharge: 0,
      grandTotal: 500,
      paymentMethod: "razorpay",
      orderStatus: "pending",
      paymentStatus: "pending",
      orderNumber: "ORD_SEC_T3_" + Date.now(),
      razorpayOrderId: "order_mock_t3_" + Date.now(),
    });

    const payment3 = await Payment.create({
      user: userA._id,
      order: order3._id,
      razorpayOrderId: order3.razorpayOrderId,
      amount: 50000,
      currency: "INR",
      receipt: order3.orderNumber,
      status: "created",
    });

    let errorThrown = null;
    try {
      await paymentService.verifyPayment(userA._id, {
        razorpay_order_id: order3.razorpayOrderId,
        razorpay_payment_id: "pay_mock_fake_123",
        razorpay_signature: "forged_malicious_signature_hex_1234567890",
      });
    } catch (err) {
      errorThrown = err;
    }

    assert(errorThrown !== null, "Invalid signature threw error");
    assert(errorThrown.statusCode === 400, `Rejected with HTTP 400 (got ${errorThrown?.statusCode})`);
    assert(errorThrown.message.includes("Invalid signature"), `Rejection reason indicates invalid signature: ${errorThrown?.message}`);

    const order3After = await Order.findById(order3._id);
    const payment3After = await Payment.findById(payment3._id);
    assert(order3After.paymentStatus === "pending", "Order paymentStatus is NOT paid");
    assert(payment3After.status === "failed", "Payment status marked as failed");
  }
  console.log();

  // -------------------------------------------------------------
  // TEST 4: Duplicate valid verification → idempotent
  // -------------------------------------------------------------
  console.log("👉 TEST 4: Duplicate valid verification → Idempotent");
  {
    // Cake stock before duplicate test
    const cakeBefore = await Cake.findById(testCake._id);
    const stockBefore = cakeBefore.variants[0].stock;

    const order4 = await Order.create({
      user: userA._id,
      items: [
        {
          cake: testCake._id,
          name: testCake.name,
          flavor: "Chocolate",
          size: "1 kg",
          quantity: 1,
          unitPrice: 500,
          discount: 0,
        },
      ],
      shippingAddress: standardAddress,
      subtotal: 500,
      deliveryCharge: 0,
      grandTotal: 500,
      paymentMethod: "razorpay",
      orderStatus: "pending",
      paymentStatus: "pending",
      orderNumber: "ORD_SEC_T4_" + Date.now(),
      razorpayOrderId: "order_mock_t4_" + Date.now(),
    });

    const payment4 = await Payment.create({
      user: userA._id,
      order: order4._id,
      razorpayOrderId: order4.razorpayOrderId,
      amount: 50000,
      currency: "INR",
      receipt: order4.orderNumber,
      status: "created",
    });

    const paymentId4 = "pay_mock_t4_" + Date.now();
    const validSig4 = generateValidRazorpaySignature(order4.razorpayOrderId, paymentId4);

    // 1st Verification
    const res1 = await paymentService.verifyPayment(userA._id, {
      razorpay_order_id: order4.razorpayOrderId,
      razorpay_payment_id: paymentId4,
      razorpay_signature: validSig4,
    });
    assert(res1.success === true, "1st verification succeeded");

    const cakeAfter1 = await Cake.findById(testCake._id);
    assert(cakeAfter1.variants[0].stock === stockBefore - 1, "Stock deducted once");

    // 2nd (Duplicate) Verification
    const res2 = await paymentService.verifyPayment(userA._id, {
      razorpay_order_id: order4.razorpayOrderId,
      razorpay_payment_id: paymentId4,
      razorpay_signature: validSig4,
    });

    assert(res2.success === true, "2nd duplicate verification returned success safely");
    assert(res2.message === "Payment already verified", `Message is 'Payment already verified' (got '${res2.message}')`);

    // Verify stock was NOT deducted again
    const cakeAfter2 = await Cake.findById(testCake._id);
    assert(cakeAfter2.variants[0].stock === stockBefore - 1, `Stock was NOT deducted again (remained ${cakeAfter2.variants[0].stock})`);
  }
  console.log();

  // -------------------------------------------------------------
  // TEST 5: Cancelled order callback → rejected
  // -------------------------------------------------------------
  console.log("👉 TEST 5: Cancelled order callback → rejected (Cannot revive cancelled order)");
  {
    // Subtest 5A: Verification API rejected on cancelled order
    const order5 = await Order.create({
      user: userA._id,
      items: [
        {
          cake: testCake._id,
          name: testCake.name,
          flavor: "Chocolate",
          size: "1 kg",
          quantity: 1,
          unitPrice: 500,
          discount: 0,
        },
      ],
      shippingAddress: standardAddress,
      subtotal: 500,
      deliveryCharge: 0,
      grandTotal: 500,
      paymentMethod: "razorpay",
      orderStatus: "cancelled", // Already cancelled!
      paymentStatus: "failed",
      orderNumber: "ORD_SEC_T5_" + Date.now(),
      razorpayOrderId: "order_mock_t5_" + Date.now(),
    });

    const payment5 = await Payment.create({
      user: userA._id,
      order: order5._id,
      razorpayOrderId: order5.razorpayOrderId,
      amount: 50000,
      currency: "INR",
      receipt: order5.orderNumber,
      status: "created",
    });

    const paymentId5 = "pay_mock_t5_" + Date.now();
    const validSig5 = generateValidRazorpaySignature(order5.razorpayOrderId, paymentId5);

    let errorThrown5A = null;
    try {
      await paymentService.verifyPayment(userA._id, {
        razorpay_order_id: order5.razorpayOrderId,
        razorpay_payment_id: paymentId5,
        razorpay_signature: validSig5,
      });
    } catch (err) {
      errorThrown5A = err;
    }

    assert(errorThrown5A !== null, "verifyPayment threw error on cancelled order");
    assert(errorThrown5A.statusCode === 400, "Rejected with HTTP 400");
    assert(errorThrown5A.message.includes("cancelled"), `Error message indicates order is cancelled: '${errorThrown5A.message}'`);

    const order5AfterA = await Order.findById(order5._id);
    assert(order5AfterA.orderStatus === "cancelled", "Cancelled order was NOT revived to confirmed");

    // Subtest 5B: Webhook callback rejected on cancelled order
    const webhookPayload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_webhook_t5_" + Date.now(),
            order_id: order5.razorpayOrderId,
            amount: 50000,
            currency: "INR",
            status: "captured",
            method: "upi",
            email: "user_a_sec@ossamcake.com",
            contact: "9111111111",
          },
        },
      },
    };
    const webhookSig = generateValidWebhookSignature(webhookPayload);
    const webhookRes = await paymentService.handleWebhook(webhookPayload, webhookSig);

    assert(webhookRes.processed === false, "Webhook rejected processing for cancelled order");
    assert(webhookRes.reason === "Order is cancelled", `Webhook rejection reason is 'Order is cancelled' (got '${webhookRes.reason}')`);

    const order5AfterB = await Order.findById(order5._id);
    assert(order5AfterB.orderStatus === "cancelled", "Order remained cancelled after webhook attempt");
  }
  console.log();

  // -------------------------------------------------------------
  // TEST 6: Refunded payment callback → rejected
  // -------------------------------------------------------------
  console.log("👉 TEST 6: Refunded payment callback → rejected (Cannot process payment on refunded transaction)");
  {
    const order6 = await Order.create({
      user: userA._id,
      items: [
        {
          cake: testCake._id,
          name: testCake.name,
          flavor: "Chocolate",
          size: "1 kg",
          quantity: 1,
          unitPrice: 500,
          discount: 0,
        },
      ],
      shippingAddress: standardAddress,
      subtotal: 500,
      deliveryCharge: 0,
      grandTotal: 500,
      paymentMethod: "razorpay",
      orderStatus: "refunded",
      paymentStatus: "refunded",
      orderNumber: "ORD_SEC_T6_" + Date.now(),
      razorpayOrderId: "order_mock_t6_" + Date.now(),
    });

    const payment6 = await Payment.create({
      user: userA._id,
      order: order6._id,
      razorpayOrderId: order6.razorpayOrderId,
      amount: 50000,
      currency: "INR",
      receipt: order6.orderNumber,
      status: "refunded",
    });

    const paymentId6 = "pay_mock_t6_" + Date.now();
    const validSig6 = generateValidRazorpaySignature(order6.razorpayOrderId, paymentId6);

    let errorThrown6 = null;
    try {
      await paymentService.verifyPayment(userA._id, {
        razorpay_order_id: order6.razorpayOrderId,
        razorpay_payment_id: paymentId6,
        razorpay_signature: validSig6,
      });
    } catch (err) {
      errorThrown6 = err;
    }

    assert(errorThrown6 !== null, "verifyPayment threw error on refunded transaction");
    assert(errorThrown6.statusCode === 400, "Rejected with HTTP 400");
    assert(errorThrown6.message.includes("refunded"), `Error message indicates refunded: '${errorThrown6.message}'`);

    // Webhook callback on refunded order
    const webhookPayload6 = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_webhook_t6_" + Date.now(),
            order_id: order6.razorpayOrderId,
            amount: 50000,
            currency: "INR",
            status: "captured",
            method: "upi",
            email: "user_a_sec@ossamcake.com",
            contact: "9111111111",
          },
        },
      },
    };
    const webhookSig6 = generateValidWebhookSignature(webhookPayload6);
    const webhookRes6 = await paymentService.handleWebhook(webhookPayload6, webhookSig6);

    assert(webhookRes6.processed === false, "Webhook rejected processing on refunded transaction");
    assert(webhookRes6.reason === "Transaction is refunded", `Webhook reason is 'Transaction is refunded' (got '${webhookRes6.reason}')`);
  }
  console.log();

  // -------------------------------------------------------------
  // TEST 7: Stripe ownership & state protection still works
  // -------------------------------------------------------------
  console.log("👉 TEST 7: Stripe ownership & state protection checks");
  {
    // Subtest 7A: User A attempts to confirm User B's Stripe PaymentIntent -> 403 Forbidden
    const order7A = await Order.create({
      user: userB._id, // Belongs to User B
      items: [
        {
          cake: testCake._id,
          name: testCake.name,
          flavor: "Chocolate",
          size: "1 kg",
          quantity: 1,
          unitPrice: 500,
          discount: 0,
        },
      ],
      shippingAddress: standardAddress,
      subtotal: 500,
      deliveryCharge: 0,
      grandTotal: 500,
      paymentMethod: "stripe",
      paymentProvider: "stripe",
      orderStatus: "pending",
      paymentStatus: "pending",
      orderNumber: "ORD_SEC_T7A_" + Date.now(),
      stripePaymentIntentId: "pi_sec_user_b_" + Date.now(),
    });

    const payment7A = await Payment.create({
      user: userB._id, // User B
      order: order7A._id,
      provider: "stripe",
      stripePaymentIntentId: order7A.stripePaymentIntentId,
      amount: 50000,
      currency: "INR",
      status: "created",
    });

    let error7A = null;
    try {
      // User A attempts to confirm User B's Stripe payment
      await paymentService.confirmStripePayment(userA._id, {
        paymentIntentId: order7A.stripePaymentIntentId,
      });
    } catch (err) {
      error7A = err;
    }

    assert(error7A !== null, "User A confirm User B's Stripe payment threw error");
    assert(error7A.statusCode === 403, `HTTP status is 403 (got ${error7A?.statusCode})`);
    assert(error7A.message === "Unauthorized access to payment", `Message is 'Unauthorized access to payment' (got '${error7A?.message}')`);

    // Subtest 7B: Stripe confirmation on a cancelled order -> 400
    const order7B = await Order.create({
      user: userA._id,
      items: [
        {
          cake: testCake._id,
          name: testCake.name,
          flavor: "Chocolate",
          size: "1 kg",
          quantity: 1,
          unitPrice: 500,
          discount: 0,
        },
      ],
      shippingAddress: standardAddress,
      subtotal: 500,
      deliveryCharge: 0,
      grandTotal: 500,
      paymentMethod: "stripe",
      paymentProvider: "stripe",
      orderStatus: "cancelled", // Cancelled!
      paymentStatus: "failed",
      orderNumber: "ORD_SEC_T7B_" + Date.now(),
      stripePaymentIntentId: "pi_sec_user_a_canc_" + Date.now(),
    });

    const payment7B = await Payment.create({
      user: userA._id,
      order: order7B._id,
      provider: "stripe",
      stripePaymentIntentId: order7B.stripePaymentIntentId,
      amount: 50000,
      currency: "INR",
      status: "created",
    });

    let error7B = null;
    try {
      await paymentService.confirmStripePayment(userA._id, {
        paymentIntentId: order7B.stripePaymentIntentId,
      });
    } catch (err) {
      error7B = err;
    }

    assert(error7B !== null, "confirmStripePayment rejected cancelled order");
    assert(error7B.statusCode === 400, "Rejected with HTTP 400");
    assert(error7B.message.includes("cancelled"), `Error message indicates cancelled: '${error7B.message}'`);

    // Subtest 7C: Stripe webhook rejecting revival of cancelled order
    const stripeWebhookPayload = {
      id: "evt_sec_t7c_" + Date.now(),
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: order7B.stripePaymentIntentId,
          amount: 50000,
          amount_received: 50000,
          currency: "inr",
          payment_method_types: ["card"],
        },
      },
    };
    const stripeWebhookRes = await paymentService.handleStripeWebhook(
      JSON.stringify(stripeWebhookPayload),
      "test_mock_stripe_sig"
    );

    assert(stripeWebhookRes.processed === false, "Stripe webhook rejected reviving cancelled order");
    assert(stripeWebhookRes.reason === "Order is cancelled", `Rejection reason is 'Order is cancelled' (got '${stripeWebhookRes.reason}')`);

    const order7BAfter = await Order.findById(order7B._id);
    assert(order7BAfter.orderStatus === "cancelled", "Order remained cancelled");
  }
  console.log();

  // -------------------------------------------------------------
  // TEST 8: Cash on Delivery (COD) still works
  // -------------------------------------------------------------
  console.log("👉 TEST 8: Cash on Delivery (COD) functionality unchanged");
  {
    // Setup Cart for User A
    await Cart.findOneAndUpdate(
      { user: userA._id },
      {
        items: [
          {
            cake: testCake._id,
            flavor: "Chocolate",
            size: "1 kg",
            quantity: 1,
            unitPrice: 500,
            discount: 0,
            totalPrice: 500,
          },
        ],
        appliedCoupon: "",
        couponDiscount: 0,
      },
      { upsert: true }
    );

    const cakeStockBeforeCod = (await Cake.findById(testCake._id)).variants[0].stock;

    const codResult = await orderService.placeOrder(userA._id, {
      shippingAddress: {
        name: "User A COD",
        phone: "9111111111",
        street: "123 COD Street",
        city: "Delhi",
        state: "Delhi",
        zip: "110001",
      },
      paymentMethod: "cod",
    });

    assert(codResult.requiresPayment === false, "COD order indicates requiresPayment: false");
    assert(codResult.order.orderStatus === "confirmed", "COD order is confirmed immediately");
    assert(codResult.order.paymentStatus === "pending", "COD paymentStatus is pending");
    assert(codResult.order.paymentMethod === "cod", "COD order paymentMethod is 'cod'");

    // Check cart was cleared
    const userCartAfterCod = await Cart.findOne({ user: userA._id });
    assert(userCartAfterCod.items.length === 0, "User cart cleared upon COD order placement");

    // Check stock was reduced
    const cakeStockAfterCod = (await Cake.findById(testCake._id)).variants[0].stock;
    assert(cakeStockAfterCod === cakeStockBeforeCod - 1, `Stock reduced by 1 for COD order (was ${cakeStockBeforeCod}, now ${cakeStockAfterCod})`);
  }
  console.log();

  // Clean up test data
  console.log("🧹 Cleaning up security test database records...");
  await Order.deleteMany({ orderNumber: { $regex: /^ORD_SEC_T/ } });
  await Payment.deleteMany({ receipt: { $regex: /^ORD_SEC_T/ } });
  await Payment.deleteMany({ stripePaymentIntentId: { $regex: /^pi_sec_/ } });
  console.log("✅ Cleanup complete.\n");

  console.log("==================================================================");
  console.log(`🎯 OWNERSHIP & STATE PROTECTION RESULTS: ${passedTests}/${totalTests} PASSED`);
  console.log("==================================================================");

  await mongoose.disconnect();
}

runOwnershipAndStateSecurityTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
