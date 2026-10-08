require("dotenv").config();
const mongoose = require("mongoose");
const assert = require("assert");
const paymentService = require("./src/services/paymentService");
const razorpayService = require("./src/services/razorpay.service");
const stripeService = require("./src/services/stripe.service");
const paymentController = require("./src/controllers/paymentController");
const orderService = require("./src/services/orderService");
const cartService = require("./src/services/cartService");
const User = require("./src/models/User");
const Cake = require("./src/models/Cake");
const Cart = require("./src/models/Cart");
const Order = require("./src/models/Order");
const Payment = require("./src/models/Payment");

async function runProviderConfigurationVerification() {
  console.log("==================================================================");
  console.log("🛠️ OSSAMCAKE PAYMENT PROVIDER CONFIGURATION VERIFICATION");
  console.log("==================================================================");

  let passedTests = 0;
  let totalTests = 0;

  function record(name, pass, detail = "") {
    totalTests++;
    if (pass) {
      passedTests++;
      console.log(`  ✅ PASS: ${name}${detail ? ` (${detail})` : ""}`);
    } else {
      console.error(`  ❌ FAIL: ${name}${detail ? ` (${detail})` : ""}`);
    }
  }

  // 1. Verify Payment Configuration Status
  console.log("\n👉 SECTION 1: Payment Gateway Provider Status & Flags");
  const config = paymentService.getConfigurationStatus();
  
  record("Payment Provider is 'razorpay'", config.provider === "razorpay", `Provider: ${config.provider}`);
  record("COD is ENABLED", config.cod?.isEnabled === true);
  record("Razorpay is ENABLED", config.razorpay?.isEnabled === true);
  record("Razorpay is in TEST mode", config.razorpay?.mode === "test", `Mode: ${config.razorpay?.mode}`);
  record("Razorpay Key ID starts with 'rzp_test_'", config.razorpay?.hasKeyId && razorpayService.getKeyId().startsWith("rzp_test_"));
  record("Stripe is completely DISABLED", config.stripe?.isEnabled === false && config.stripe?.isConfigured === false);

  // 2. Verify Stripe Endpoints are cleanly disabled at controller level
  console.log("\n👉 SECTION 2: Stripe Controller Isolation (HTTP Guards)");
  
  // Test createStripeIntent via mock req/res
  let stripeIntentBlocked = false;
  let stripeIntentMessage = "";
  try {
    const mockReq = { user: { _id: new mongoose.Types.ObjectId() }, body: {} };
    const mockRes = {};
    const mockNext = (err) => {
      if (err && err.statusCode === 503) {
        stripeIntentBlocked = true;
        stripeIntentMessage = err.message;
      }
    };
    await paymentController.createStripeIntent(mockReq, mockRes, mockNext);
  } catch (err) {
    if (err.statusCode === 503) {
      stripeIntentBlocked = true;
      stripeIntentMessage = err.message;
    }
  }
  record("createStripeIntent returns HTTP 503 Service Unavailable", stripeIntentBlocked, stripeIntentMessage);

  // Test confirmStripePayment via mock req/res
  let stripeConfirmBlocked = false;
  let stripeConfirmMessage = "";
  try {
    const mockReq = { user: { _id: new mongoose.Types.ObjectId() }, body: {} };
    const mockRes = {};
    const mockNext = (err) => {
      if (err && err.statusCode === 503) {
        stripeConfirmBlocked = true;
        stripeConfirmMessage = err.message;
      }
    };
    await paymentController.confirmStripePayment(mockReq, mockRes, mockNext);
  } catch (err) {
    if (err.statusCode === 503) {
      stripeConfirmBlocked = true;
      stripeConfirmMessage = err.message;
    }
  }
  record("confirmStripePayment returns HTTP 503 Service Unavailable", stripeConfirmBlocked, stripeConfirmMessage);

  // Test getStripeKey
  let stripeKeyDisabled = false;
  const mockKeyReq = {};
  const mockKeyRes = {
    status: (code) => ({
      json: (payload) => {
        if (code === 200 && payload.data?.isEnabled === false && payload.data?.publishableKey === "") {
          stripeKeyDisabled = true;
        }
      }
    })
  };
  await paymentController.getStripeKey(mockKeyReq, mockKeyRes, () => {});
  record("getStripeKey returns empty key and isEnabled: false", stripeKeyDisabled);

  // Test handleStripeWebhook
  let stripeWebhookInactive = false;
  const mockWebhookReq = { headers: {} };
  const mockWebhookRes = {
    status: (code) => ({
      json: (payload) => {
        if (code === 200 && payload.data?.disabled === true && payload.data?.processed === false) {
          stripeWebhookInactive = true;
        }
      }
    })
  };
  await paymentController.handleStripeWebhook(mockWebhookReq, mockWebhookRes, () => {});
  record("handleStripeWebhook acknowledges without processing (disabled: true)", stripeWebhookInactive);

  // 3. Connect to Database for live flow tests
  await mongoose.connect(process.env.MONGO_URI);
  console.log("\n✅ Connected to MongoDB Atlas");

  // 4. Test Razorpay Live Flow with real DB models
  console.log("\n👉 SECTION 3: Razorpay Test Mode Order Flow & Security Protections");
  const testUser = await User.create({
    name: "Razorpay Test Customer",
    email: `rzp_test_${Date.now()}@test.com`,
    password: "Password123!",
  });

  const testCake = await Cake.create({
    name: "Razorpay Gate Test Cake",
    slug: `rzp-test-cake-${Date.now()}`,
    basePrice: 500,
    price: 500,
    category: "Cakes",
    variants: [{ flavor: "Vanilla", size: "1 kg", stock: 10, price: 500, discount: 0 }],
  });

  // Setup cart
  await cartService.addItemToCart(testUser._id, {
    cakeId: testCake._id,
    flavor: "Vanilla",
    size: "1 kg",
    quantity: 1,
  });

  // Place Razorpay order
  const orderPlacement = await orderService.placeOrder(testUser._id, {
    shippingAddress: {
      name: "Razorpay Tester",
      phone: "9876543210",
      street: "Test Lane",
      city: "Mumbai",
      zip: "400001",
    },
    paymentMethod: "razorpay",
  });
  const order = orderPlacement.order;

  record("Razorpay pending order created with paymentMethod 'razorpay'", order.paymentMethod === "razorpay" && order.orderStatus === "pending");

  // Create Razorpay payment order
  const paymentOrder = await paymentService.createPaymentOrder(testUser._id, order._id);
  record("Razorpay payment order generated", !!paymentOrder.orderId && paymentOrder.amount === order.grandTotal * 100);
  record("Frontend receives public Razorpay Key ID only", paymentOrder.keyId.startsWith("rzp_test_"));

  // Verify signature & complete order
  const crypto = require("crypto");
  const fakePaymentId = `pay_test_${Date.now()}`;
  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${paymentOrder.orderId}|${fakePaymentId}`);
  const validSignature = hmac.digest("hex");

  const verifyResult = await paymentService.verifyPayment(testUser._id, {
    razorpay_order_id: paymentOrder.orderId,
    razorpay_payment_id: fakePaymentId,
    razorpay_signature: validSignature,
  });

  record("Razorpay verification marks order 'confirmed' and payment 'paid'", verifyResult.order.orderStatus === "confirmed" && verifyResult.order.paymentStatus === "paid");
  
  // Verify stock deduction
  const updatedCake = await Cake.findById(testCake._id);
  const remainingStock = updatedCake.variants[0].stock;
  record("Stock atomically decremented by 1 (10 -> 9)", remainingStock === 9);

  // 5. Test COD Flow
  console.log("\n👉 SECTION 4: Cash on Delivery (COD) Flow & Stock Verification");
  await cartService.addItemToCart(testUser._id, {
    cakeId: testCake._id,
    flavor: "Vanilla",
    size: "1 kg",
    quantity: 2,
  });

  const codPlacement = await orderService.placeOrder(testUser._id, {
    shippingAddress: {
      name: "COD Tester",
      phone: "9876543210",
      street: "COD Lane",
      city: "Mumbai",
      zip: "400001",
    },
    paymentMethod: "cod",
  });

  record("COD order confirmed immediately", codPlacement.order.orderStatus === "confirmed");
  record("COD paymentStatus is pending", codPlacement.order.paymentStatus === "pending");
  record("COD paymentMethod is 'cod'", codPlacement.order.paymentMethod === "cod");

  const cakeAfterCod = await Cake.findById(testCake._id);
  record("COD atomically decremented stock by 2 (9 -> 7)", cakeAfterCod.variants[0].stock === 7);

  // Cart was cleared
  const cartAfterCod = await Cart.findOne({ user: testUser._id });
  record("User cart cleared upon COD order placement", cartAfterCod.items.length === 0);

  // Clean up
  await User.findByIdAndDelete(testUser._id);
  await Cake.findByIdAndDelete(testCake._id);
  await Order.findByIdAndDelete(order._id);
  await Order.findByIdAndDelete(codPlacement.order._id);
  await Payment.deleteMany({ user: testUser._id });
  await Cart.deleteOne({ user: testUser._id });
  await mongoose.disconnect();

  console.log("\n==================================================================");
  console.log(`🎯 VERIFICATION RESULTS: ${passedTests}/${totalTests} PASSED`);
  console.log("==================================================================");

  if (passedTests === totalTests) {
    console.log("🎉 ALL PROVIDER CONFIGURATION TESTS PASSED PERFECTLY!");
    process.exit(0);
  } else {
    console.error("❌ Some verification checks failed!");
    process.exit(1);
  }
}

runProviderConfigurationVerification().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
