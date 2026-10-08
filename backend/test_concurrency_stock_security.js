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

async function runConcurrencyAndStockSecurityTests() {
  console.log("==================================================================");
  console.log("🔒 OSSAMCAKE PAYMENT SECURITY FIX #3: CONCURRENCY & ATOMIC STOCK");
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

  // 1. Setup Test User
  let testUser = await User.findOne({ email: "concurrency_user@ossamcake.com" });
  if (!testUser) {
    testUser = await User.create({
      name: "Concurrency Tester",
      email: "concurrency_user@ossamcake.com",
      password: "Password123!",
      mobileNumber: "9333333333",
    });
  }

  // 2. Setup Test Cakes with known stock
  let testCake = await Cake.findOne({ slug: "sec-concurrency-test-cake" });
  if (!testCake) {
    testCake = await Cake.create({
      name: "Concurrency Test Cake",
      slug: "sec-concurrency-test-cake",
      basePrice: 600,
      discount: 0,
      status: "active",
      variants: [
        { flavor: "Vanilla", size: "1 kg", price: 600, stock: 100, status: "active" },
      ],
    });
  } else {
    testCake.variants[0].stock = 100;
    await testCake.save();
  }

  const standardAddress = {
    name: "Concurrency Tester",
    phone: "9333333333",
    street: "777 Speed Way",
    city: "Mumbai",
    state: "Maharashtra",
    zip: "400001",
  };

  function generateValidRazorpaySignature(orderId, paymentId) {
    const secret = process.env.RAZORPAY_KEY_SECRET || "3Osa2FhJdFC4TyeMePZl6vMG";
    const body = orderId + "|" + paymentId;
    return crypto.createHmac("sha256", secret).update(body).digest("hex");
  }

  function generateValidWebhookSignature(payloadObj) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "cake_webhook_secret_test_123";
    const body = JSON.stringify(payloadObj);
    return crypto.createHmac("sha256", secret).update(body).digest("hex");
  }

  // -------------------------------------------------------------
  // TEST 1: Simultaneous Execution: Confirm (A) + Webhook (B)
  // -------------------------------------------------------------
  console.log("👉 TEST 1: Concurrent Razorpay Confirm + Webhook at the exact same time");
  {
    const initialStock = 100;
    testCake.variants[0].stock = initialStock;
    await testCake.save();

    const orderId = "order_conc_t1_" + Date.now();
    const paymentId = "pay_conc_t1_" + Date.now();
    const validSig = generateValidRazorpaySignature(orderId, paymentId);

    const order1 = await Order.create({
      user: testUser._id,
      items: [
        {
          cake: testCake._id,
          name: testCake.name,
          flavor: "Vanilla",
          size: "1 kg",
          quantity: 1,
          unitPrice: 600,
          discount: 0,
        },
      ],
      shippingAddress: standardAddress,
      subtotal: 600,
      deliveryCharge: 0,
      grandTotal: 600,
      paymentMethod: "razorpay",
      orderStatus: "pending",
      paymentStatus: "pending",
      orderNumber: "ORD_CONC_T1_" + Date.now(),
      razorpayOrderId: orderId,
    });

    const payment1 = await Payment.create({
      user: testUser._id,
      order: order1._id,
      razorpayOrderId: orderId,
      amount: 60000,
      currency: "INR",
      receipt: order1.orderNumber,
      status: "created",
    });

    const webhookPayload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: orderId,
            amount: 60000,
            currency: "INR",
            status: "captured",
            method: "upi",
            email: "concurrency_user@ossamcake.com",
            contact: "9333333333",
          },
        },
      },
    };
    const webhookSig = generateValidWebhookSignature(webhookPayload);

    // Fire both simultaneously via Promise.all
    const [resConfirm, resWebhook] = await Promise.all([
      paymentService.verifyPayment(testUser._id, {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSig,
      }),
      paymentService.handleWebhook(webhookPayload, webhookSig),
    ]);

    assert(resConfirm.success === true, "Client verification completed successfully");
    assert(resWebhook.received === true, "Webhook acknowledged successfully");

    const payment1After = await Payment.findById(payment1._id);
    assert(payment1After.isStockReduced === true, "Payment.isStockReduced is true");
    assert(payment1After.status === "captured", "Payment status is captured");

    const order1After = await Order.findById(order1._id);
    assert(order1After.orderStatus === "confirmed", "Order status is confirmed");
    assert(order1After.paymentStatus === "paid", "Order paymentStatus is paid");

    const cakeAfter = await Cake.findById(testCake._id);
    assert(cakeAfter.variants[0].stock === initialStock - 1, `Stock was deducted EXACTLY ONCE (expected ${initialStock - 1}, got ${cakeAfter.variants[0].stock})`);
  }
  console.log();

  // -------------------------------------------------------------
  // TEST 2: Reversed Simultaneous Execution: Webhook (B) + Confirm (A)
  // -------------------------------------------------------------
  console.log("👉 TEST 2: Reversed Concurrent: Webhook arrives first / simultaneous with Confirm");
  {
    const cakeBefore = await Cake.findById(testCake._id);
    const stockBefore = cakeBefore.variants[0].stock;

    const orderId = "order_conc_t2_" + Date.now();
    const paymentId = "pay_conc_t2_" + Date.now();
    const validSig = generateValidRazorpaySignature(orderId, paymentId);

    const order2 = await Order.create({
      user: testUser._id,
      items: [
        {
          cake: testCake._id,
          name: testCake.name,
          flavor: "Vanilla",
          size: "1 kg",
          quantity: 1,
          unitPrice: 600,
          discount: 0,
        },
      ],
      shippingAddress: standardAddress,
      subtotal: 600,
      deliveryCharge: 0,
      grandTotal: 600,
      paymentMethod: "razorpay",
      orderStatus: "pending",
      paymentStatus: "pending",
      orderNumber: "ORD_CONC_T2_" + Date.now(),
      razorpayOrderId: orderId,
    });

    const payment2 = await Payment.create({
      user: testUser._id,
      order: order2._id,
      razorpayOrderId: orderId,
      amount: 60000,
      currency: "INR",
      receipt: order2.orderNumber,
      status: "created",
    });

    const webhookPayload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: orderId,
            amount: 60000,
            currency: "INR",
            status: "captured",
            method: "card",
            email: "concurrency_user@ossamcake.com",
            contact: "9333333333",
          },
        },
      },
    };
    const webhookSig = generateValidWebhookSignature(webhookPayload);

    // Fire reversed order simultaneously
    const [resWebhook, resConfirm] = await Promise.all([
      paymentService.handleWebhook(webhookPayload, webhookSig),
      paymentService.verifyPayment(testUser._id, {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSig,
      }),
    ]);

    assert(resWebhook.received === true, "Webhook acknowledged");
    assert(resConfirm.success === true, "Client verification completed safely");

    const cakeAfter = await Cake.findById(testCake._id);
    assert(cakeAfter.variants[0].stock === stockBefore - 1, `Stock was deducted EXACTLY ONCE in reversed order (expected ${stockBefore - 1}, got ${cakeAfter.variants[0].stock})`);

    const payment2After = await Payment.findById(payment2._id);
    assert(payment2After.isStockReduced === true, "Payment.isStockReduced is true");
  }
  console.log();

  // -------------------------------------------------------------
  // TEST 3: Stripe Concurrency: Confirm + Stripe Webhook
  // -------------------------------------------------------------
  console.log("👉 TEST 3: Concurrent Stripe Confirm + Stripe Webhook");
  {
    const cakeBefore = await Cake.findById(testCake._id);
    const stockBefore = cakeBefore.variants[0].stock;

    const stripePiId = "pi_conc_stripe_" + Date.now();

    const order3 = await Order.create({
      user: testUser._id,
      items: [
        {
          cake: testCake._id,
          name: testCake.name,
          flavor: "Vanilla",
          size: "1 kg",
          quantity: 1,
          unitPrice: 600,
          discount: 0,
        },
      ],
      shippingAddress: standardAddress,
      subtotal: 600,
      deliveryCharge: 0,
      grandTotal: 600,
      paymentMethod: "stripe",
      paymentProvider: "stripe",
      orderStatus: "pending",
      paymentStatus: "pending",
      orderNumber: "ORD_CONC_T3_" + Date.now(),
      stripePaymentIntentId: stripePiId,
    });

    const payment3 = await Payment.create({
      user: testUser._id,
      order: order3._id,
      provider: "stripe",
      stripePaymentIntentId: stripePiId,
      amount: 60000,
      currency: "INR",
      status: "created",
    });

    const stripeWebhookPayload = {
      id: "evt_conc_stripe_" + Date.now(),
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: stripePiId,
          amount: 60000,
          amount_received: 60000,
          currency: "inr",
          payment_method_types: ["card"],
        },
      },
    };

    // Fire both Stripe confirm and Stripe webhook concurrently
    const [resStripeConfirm, resStripeWebhook] = await Promise.all([
      paymentService.confirmStripePayment(testUser._id, {
        paymentIntentId: stripePiId,
      }),
      paymentService.handleStripeWebhook(
        JSON.stringify(stripeWebhookPayload),
        "test_mock_stripe_sig"
      ),
    ]);

    assert(resStripeConfirm.success === true, "Stripe confirmation succeeded");
    assert(resStripeWebhook.received === true, "Stripe webhook acknowledged");

    const cakeAfter = await Cake.findById(testCake._id);
    assert(cakeAfter.variants[0].stock === stockBefore - 1, `Stripe stock deducted EXACTLY ONCE under concurrency (expected ${stockBefore - 1}, got ${cakeAfter.variants[0].stock})`);

    const payment3After = await Payment.findById(payment3._id);
    assert(payment3After.isStockReduced === true, "Stripe Payment.isStockReduced is true");
  }
  console.log();

  // -------------------------------------------------------------
  // TEST 4: Duplicate Webhook Deliveries (Idempotent Stock)
  // -------------------------------------------------------------
  console.log("👉 TEST 4: Duplicate Webhook deliveries do not deduct stock again");
  {
    const cakeBefore = await Cake.findById(testCake._id);
    const stockBefore = cakeBefore.variants[0].stock;

    const orderId = "order_conc_t4_" + Date.now();
    const paymentId = "pay_conc_t4_" + Date.now();

    const order4 = await Order.create({
      user: testUser._id,
      items: [
        {
          cake: testCake._id,
          name: testCake.name,
          flavor: "Vanilla",
          size: "1 kg",
          quantity: 1,
          unitPrice: 600,
          discount: 0,
        },
      ],
      shippingAddress: standardAddress,
      subtotal: 600,
      deliveryCharge: 0,
      grandTotal: 600,
      paymentMethod: "razorpay",
      orderStatus: "pending",
      paymentStatus: "pending",
      orderNumber: "ORD_CONC_T4_" + Date.now(),
      razorpayOrderId: orderId,
    });

    const payment4 = await Payment.create({
      user: testUser._id,
      order: order4._id,
      razorpayOrderId: orderId,
      amount: 60000,
      currency: "INR",
      receipt: order4.orderNumber,
      status: "created",
    });

    const webhookPayload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: orderId,
            amount: 60000,
            currency: "INR",
            status: "captured",
            method: "upi",
            email: "concurrency_user@ossamcake.com",
            contact: "9333333333",
          },
        },
      },
    };
    const webhookSig = generateValidWebhookSignature(webhookPayload);

    // 1st Webhook delivery
    const wh1 = await paymentService.handleWebhook(webhookPayload, webhookSig);
    assert(wh1.processed === true, "1st webhook delivery processed");

    const cakeAfter1 = await Cake.findById(testCake._id);
    assert(cakeAfter1.variants[0].stock === stockBefore - 1, "Stock deducted once after 1st webhook");

    // 2nd Duplicate Webhook delivery
    const wh2 = await paymentService.handleWebhook(webhookPayload, webhookSig);
    assert(wh2.duplicate === true || wh2.processed === true, "2nd duplicate webhook handled idempotently");

    // 3rd Duplicate Webhook delivery
    const wh3 = await paymentService.handleWebhook(webhookPayload, webhookSig);
    assert(wh3.duplicate === true || wh3.processed === true, "3rd duplicate webhook handled idempotently");

    const cakeAfter3 = await Cake.findById(testCake._id);
    assert(cakeAfter3.variants[0].stock === stockBefore - 1, `Stock remained unchanged across 3 webhook deliveries (stock: ${cakeAfter3.variants[0].stock})`);
  }
  console.log();

  // -------------------------------------------------------------
  // TEST 5: Insufficient Stock Rejection (No Negative Stock)
  // -------------------------------------------------------------
  console.log("👉 TEST 5: Atomic stock condition prevents negative stock");
  {
    // Create Cake with stock = 1
    const lowStockCake = await Cake.create({
      name: "Low Stock Test Cake",
      slug: "sec-low-stock-cake-" + Date.now(),
      basePrice: 500,
      status: "active",
      variants: [
        { flavor: "Chocolate", size: "0.5 kg", price: 500, stock: 1, status: "active" },
      ],
    });

    let errorThrown = null;
    try {
      // Attempt to deduct quantity = 5 (requested > available)
      await orderService.reduceStock([
        {
          cake: lowStockCake._id,
          name: lowStockCake.name,
          flavor: "Chocolate",
          size: "0.5 kg",
          quantity: 5,
        },
      ]);
    } catch (err) {
      errorThrown = err;
    }

    assert(errorThrown !== null, "reduceStock threw error for excessive quantity");
    assert(errorThrown.statusCode === 400, "Error has status code 400");
    assert(errorThrown.message.includes("Insufficient stock"), `Error message indicates insufficient stock: '${errorThrown.message}'`);

    const refreshedCake = await Cake.findById(lowStockCake._id);
    assert(refreshedCake.variants[0].stock === 1, "Stock was NOT decremented into negative (remains 1)");

    await Cake.deleteOne({ _id: lowStockCake._id });
  }
  console.log();

  // -------------------------------------------------------------
  // TEST 6: Failure Safety & Atomic Lock Rollback
  // -------------------------------------------------------------
  console.log("👉 TEST 6: Failure Safety: Out-of-stock payment does not complete and rolls back lock");
  {
    // Cake with 0 stock
    const outOfStockCake = await Cake.create({
      name: "Zero Stock Cake",
      slug: "sec-zero-stock-cake-" + Date.now(),
      basePrice: 500,
      status: "active",
      variants: [
        { flavor: "Strawberry", size: "1 kg", price: 500, stock: 0, status: "active" },
      ],
    });

    const orderId = "order_conc_t6_" + Date.now();
    const paymentId = "pay_conc_t6_" + Date.now();
    const validSig = generateValidRazorpaySignature(orderId, paymentId);

    const order6 = await Order.create({
      user: testUser._id,
      items: [
        {
          cake: outOfStockCake._id,
          name: outOfStockCake.name,
          flavor: "Strawberry",
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
      orderNumber: "ORD_CONC_T6_" + Date.now(),
      razorpayOrderId: orderId,
    });

    const payment6 = await Payment.create({
      user: testUser._id,
      order: order6._id,
      razorpayOrderId: orderId,
      amount: 50000,
      currency: "INR",
      receipt: order6.orderNumber,
      status: "created",
    });

    let verifyError = null;
    try {
      await paymentService.verifyPayment(testUser._id, {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSig,
      });
    } catch (err) {
      verifyError = err;
    }

    assert(verifyError !== null, "Payment verification aborted on out-of-stock item");
    assert(verifyError.statusCode === 400, "Returned HTTP 400");
    assert(verifyError.message.includes("Insufficient stock"), `Error mentions insufficient stock: '${verifyError.message}'`);

    const order6After = await Order.findById(order6._id);
    assert(order6After.orderStatus === "pending", "Order was NOT marked confirmed");
    assert(order6After.paymentStatus === "pending", "Order was NOT marked paid");

    const payment6After = await Payment.findById(payment6._id);
    assert(payment6After.isStockReduced === false, "Payment lock was rolled back (isStockReduced is false)");

    await Cake.deleteOne({ _id: outOfStockCake._id });
  }
  console.log();

  // -------------------------------------------------------------
  // TEST 7: Multi-Item Order Compensation Rollback
  // -------------------------------------------------------------
  console.log("👉 TEST 7: Multi-item compensation rollback: previous item restored if subsequent item fails");
  {
    const cakeA = await Cake.create({
      name: "Multi Test Cake A (Available)",
      slug: "sec-multi-cake-a-" + Date.now(),
      basePrice: 400,
      status: "active",
      variants: [
        { flavor: "Vanilla", size: "1 kg", price: 400, stock: 10, status: "active" },
      ],
    });

    const cakeB = await Cake.create({
      name: "Multi Test Cake B (Empty)",
      slug: "sec-multi-cake-b-" + Date.now(),
      basePrice: 400,
      status: "active",
      variants: [
        { flavor: "Chocolate", size: "1 kg", price: 400, stock: 0, status: "active" },
      ],
    });

    let multiError = null;
    try {
      await orderService.reduceStock([
        { cake: cakeA._id, flavor: "Vanilla", size: "1 kg", quantity: 2 }, // Would succeed
        { cake: cakeB._id, flavor: "Chocolate", size: "1 kg", quantity: 1 }, // Will fail!
      ]);
    } catch (err) {
      multiError = err;
    }

    assert(multiError !== null, "Multi-item reduction threw error");

    // Verify Cake A's stock was rolled back to 10 (NOT left as 8)
    const cakeAAfter = await Cake.findById(cakeA._id);
    assert(cakeAAfter.variants[0].stock === 10, `Cake A stock was safely rolled back to 10 (got ${cakeAAfter.variants[0].stock})`);

    await Cake.deleteMany({ _id: { $in: [cakeA._id, cakeB._id] } });
  }
  console.log();

  // -------------------------------------------------------------
  // TEST 8: Cash on Delivery (COD) Stock Validation
  // -------------------------------------------------------------
  console.log("👉 TEST 8: COD atomic stock deduction and out-of-stock rejection");
  {
    // Scenario 8A: Out-of-stock COD order rejected
    const outCake = await Cake.create({
      name: "COD Out Of Stock Cake",
      slug: "sec-cod-out-cake-" + Date.now(),
      basePrice: 500,
      status: "active",
      variants: [
        { flavor: "Pineapple", size: "1 kg", price: 500, stock: 0, status: "active" },
      ],
    });

    await Cart.findOneAndUpdate(
      { user: testUser._id },
      {
        items: [
          {
            cake: outCake._id,
            flavor: "Pineapple",
            size: "1 kg",
            quantity: 1,
            unitPrice: 500,
            discount: 0,
            totalPrice: 500,
          },
        ],
      },
      { upsert: true }
    );

    let codError = null;
    try {
      await orderService.placeOrder(testUser._id, {
        shippingAddress: standardAddress,
        paymentMethod: "cod",
      });
    } catch (err) {
      codError = err;
    }

    assert(codError !== null, "COD order rejected for out-of-stock item");
    assert(codError.statusCode === 400, "COD error is HTTP 400");
    assert(
      codError.message.toLowerCase().includes("insufficient stock") || codError.message.toLowerCase().includes("available"),
      `Error message indicates insufficient stock: '${codError.message}'`
    );

    await Cake.deleteOne({ _id: outCake._id });

    // Scenario 8B: Valid COD order succeeds and deducts stock atomically
    const validCake = await Cake.create({
      name: "COD Valid Cake",
      slug: "sec-cod-valid-cake-" + Date.now(),
      basePrice: 500,
      status: "active",
      variants: [
        { flavor: "Butterscotch", size: "1 kg", price: 500, stock: 5, status: "active" },
      ],
    });

    await Cart.findOneAndUpdate(
      { user: testUser._id },
      {
        items: [
          {
            cake: validCake._id,
            flavor: "Butterscotch",
            size: "1 kg",
            quantity: 1,
            unitPrice: 500,
            discount: 0,
            totalPrice: 500,
          },
        ],
      },
      { upsert: true }
    );

    const codResult = await orderService.placeOrder(testUser._id, {
      shippingAddress: standardAddress,
      paymentMethod: "cod",
    });

    assert(codResult.order.orderStatus === "confirmed", "Valid COD order confirmed");
    const validCakeAfter = await Cake.findById(validCake._id);
    assert(validCakeAfter.variants[0].stock === 4, `Stock decremented from 5 to 4 for COD (got ${validCakeAfter.variants[0].stock})`);

    await Cake.deleteOne({ _id: validCake._id });
  }
  console.log();

  // Clean up test data
  console.log("🧹 Cleaning up security test database records...");
  await Order.deleteMany({ orderNumber: { $regex: /^ORD_CONC_T/ } });
  await Payment.deleteMany({ receipt: { $regex: /^ORD_CONC_T/ } });
  await Payment.deleteMany({ stripePaymentIntentId: { $regex: /^pi_conc_/ } });
  console.log("✅ Cleanup complete.\n");

  console.log("==================================================================");
  console.log(`🎯 CONCURRENCY & STOCK SECURITY RESULTS: ${passedTests}/${totalTests} PASSED`);
  console.log("==================================================================");

  await mongoose.disconnect();
}

runConcurrencyAndStockSecurityTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
