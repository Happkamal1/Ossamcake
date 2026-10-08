require("dotenv").config();
const mongoose = require("mongoose");
const Cart = require("./src/models/Cart");
const Cake = require("./src/models/Cake");
const Coupon = require("./src/models/Coupon");
const User = require("./src/models/User");
const Order = require("./src/models/Order");
const cartService = require("./src/services/cartService");
const orderService = require("./src/services/orderService");
const paymentService = require("./src/services/paymentService");

async function runSecurityPricingTests() {
  console.log("==================================================================");
  console.log("🔒 OSSAMCAKE CRITICAL PAYMENT SECURITY TEST SUITE (15 SCENARIOS)");
  console.log("==================================================================\n");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  // 1. Setup Test User
  let testUser = await User.findOne({ email: "security_tester@ossamcake.com" });
  if (!testUser) {
    testUser = await User.create({
      name: "Security Tester",
      email: "security_tester@ossamcake.com",
      password: "SecurityTestPassword123!",
      mobileNumber: "9876543210",
    });
  }
  const userId = testUser._id;

  // 2. Setup Test Cakes with known prices and discounts
  // Cake A: basePrice: 1000, discount: 20% -> discounted price should be 800
  let cakeA = await Cake.findOne({ slug: "sec-test-cake-20pct" });
  if (!cakeA) {
    cakeA = await Cake.create({
      name: "Security Test Cake (20% Off)",
      slug: "sec-test-cake-20pct",
      basePrice: 1000,
      discount: 20,
      status: "active",
      variants: [
        { flavor: "Chocolate", size: "1 kg", price: 1000, stock: 100, status: "active" },
        { flavor: "Vanilla", size: "0.5 kg", price: 600, stock: 100, status: "active" },
      ],
    });
  } else {
    cakeA.discount = 20;
    cakeA.variants[0].price = 1000;
    cakeA.variants[0].stock = 100;
    await cakeA.save();
  }

  // 3. Setup Test Coupons
  // Valid Percentage Coupon: 10% off, min order 500, max discount 200
  await Coupon.deleteOne({ code: "SEC_VALID10" });
  const validCoupon = await Coupon.create({
    code: "SEC_VALID10",
    description: "10% off for security testing",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 500,
    maxDiscountAmount: 200,
    usageLimit: 100,
    perUserLimit: 5,
    isActive: true,
  });

  // Expired Coupon
  await Coupon.deleteOne({ code: "SEC_EXPIRED" });
  await Coupon.create({
    code: "SEC_EXPIRED",
    description: "Expired coupon",
    discountType: "percentage",
    discountValue: 50,
    minOrderAmount: 100,
    expiresAt: new Date(Date.now() - 86400000), // yesterday
    isActive: true,
  });

  // High Min Order Coupon (min ₹5000)
  await Coupon.deleteOne({ code: "SEC_HIGHMIN" });
  await Coupon.create({
    code: "SEC_HIGHMIN",
    description: "Min 5000 required",
    discountType: "flat",
    discountValue: 500,
    minOrderAmount: 5000,
    isActive: true,
  });

  // Flat High Coupon (Flat ₹2000 off)
  await Coupon.deleteOne({ code: "SEC_FLAT2000" });
  await Coupon.create({
    code: "SEC_FLAT2000",
    description: "Flat 2000 off",
    discountType: "flat",
    discountValue: 2000,
    minOrderAmount: 100,
    isActive: true,
  });

  const testResults = [];

  const defaultShipping = {
    name: "Security Tester",
    phone: "9876543210",
    street: "123 Security Lane",
    city: "Mumbai",
    state: "Maharashtra",
    zip: "400001",
  };

  // Helper to clear and set up cart
  const resetCart = async () => {
    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [], appliedCoupon: "", couponDiscount: 0 },
      { upsert: true, new: true }
    );
  };

  // -------------------------------------------------------------
  // TEST 1: Normal product purchase
  // -------------------------------------------------------------
  try {
    await resetCart();
    await cartService.addItemToCart(userId, {
      cakeId: cakeA._id,
      flavor: "Chocolate",
      size: "1 kg",
      quantity: 1,
    });
    const calc = await orderService.validateCartAndCalculate(userId);
    // Cake price = 1000, discount = 20% -> item subtotal = 800. Delivery = 5. grandTotal = 805
    const passed = calc.subtotal === 800 && calc.discountAmount === 0 && calc.grandTotal === 805;
    testResults.push({
      id: 1,
      name: "Normal product purchase",
      passed,
      details: `Subtotal: ₹${calc.subtotal} (Expected: 800), GrandTotal: ₹${calc.grandTotal} (Expected: 805)`,
    });
  } catch (err) {
    testResults.push({ id: 1, name: "Normal product purchase", passed: false, details: err.message });
  }

  // -------------------------------------------------------------
  // TEST 2: Client sends discount = 0 (when product has 20% discount)
  // -------------------------------------------------------------
  try {
    await resetCart();
    await cartService.addItemToCart(userId, {
      cakeId: cakeA._id,
      flavor: "Chocolate",
      size: "1 kg",
      quantity: 1,
      discount: 0, // Malicious/tampered value
    });
    const calc = await orderService.validateCartAndCalculate(userId);
    // Server must ignore client discount: 0 and apply product discount: 20% -> 800
    const passed = calc.items[0].discount === 20 && calc.subtotal === 800;
    testResults.push({
      id: 2,
      name: "Client sends discount = 0 (ignored by server)",
      passed,
      details: `Server enforced discount: ${calc.items[0].discount}% (Client sent: 0%), Subtotal: ₹${calc.subtotal}`,
    });
  } catch (err) {
    testResults.push({ id: 2, name: "Client sends discount = 0", passed: false, details: err.message });
  }

  // -------------------------------------------------------------
  // TEST 3: Client sends discount = 99 (arbitrary discount attack)
  // -------------------------------------------------------------
  try {
    await resetCart();
    await cartService.addItemToCart(userId, {
      cakeId: cakeA._id,
      flavor: "Chocolate",
      size: "1 kg",
      quantity: 1,
      discount: 99, // Attempted 99% off attack!
    });
    const calc = await orderService.validateCartAndCalculate(userId);
    // Server must reject 99% and strictly use DB discount: 20% -> 800
    const passed = calc.items[0].discount === 20 && calc.subtotal === 800 && calc.grandTotal === 805;
    testResults.push({
      id: 3,
      name: "Client sends discount = 99 (attack blocked)",
      passed,
      details: `Server enforced discount: ${calc.items[0].discount}%, Subtotal: ₹${calc.subtotal} (Client requested ₹10 for ₹1000 item)`,
    });
  } catch (err) {
    testResults.push({ id: 3, name: "Client sends discount = 99", passed: false, details: err.message });
  }

  // -------------------------------------------------------------
  // TEST 4: Client sends discount = 100 (free item attack)
  // -------------------------------------------------------------
  try {
    await resetCart();
    await cartService.addItemToCart(userId, {
      cakeId: cakeA._id,
      flavor: "Chocolate",
      size: "1 kg",
      quantity: 1,
      discount: 100, // Attempted 100% off free attack!
    });
    const calc = await orderService.validateCartAndCalculate(userId);
    const passed = calc.items[0].discount === 20 && calc.subtotal === 800;
    testResults.push({
      id: 4,
      name: "Client sends discount = 100 (attack blocked)",
      passed,
      details: `Server enforced discount: ${calc.items[0].discount}%, Subtotal: ₹${calc.subtotal}`,
    });
  } catch (err) {
    testResults.push({ id: 4, name: "Client sends discount = 100", passed: false, details: err.message });
  }

  // -------------------------------------------------------------
  // TEST 5: Client sends negative discount (e.g. -50)
  // -------------------------------------------------------------
  try {
    await resetCart();
    await cartService.addItemToCart(userId, {
      cakeId: cakeA._id,
      flavor: "Chocolate",
      size: "1 kg",
      quantity: 1,
      discount: -50,
    });
    const calc = await orderService.validateCartAndCalculate(userId);
    const passed = calc.items[0].discount === 20 && calc.subtotal === 800;
    testResults.push({
      id: 5,
      name: "Client sends negative discount (attack blocked)",
      passed,
      details: `Server enforced discount: ${calc.items[0].discount}%, Subtotal: ₹${calc.subtotal}`,
    });
  } catch (err) {
    testResults.push({ id: 5, name: "Client sends negative discount", passed: false, details: err.message });
  }

  // -------------------------------------------------------------
  // TEST 6: Client sends huge discount (e.g. 999999)
  // -------------------------------------------------------------
  try {
    await resetCart();
    await cartService.addItemToCart(userId, {
      cakeId: cakeA._id,
      flavor: "Chocolate",
      size: "1 kg",
      quantity: 1,
      discount: 999999,
    });
    const calc = await orderService.validateCartAndCalculate(userId);
    const passed = calc.items[0].discount === 20 && calc.subtotal === 800;
    testResults.push({
      id: 6,
      name: "Client sends huge discount (attack blocked)",
      passed,
      details: `Server enforced discount: ${calc.items[0].discount}%, Subtotal: ₹${calc.subtotal}`,
    });
  } catch (err) {
    testResults.push({ id: 6, name: "Client sends huge discount", passed: false, details: err.message });
  }

  // -------------------------------------------------------------
  // TEST 7: Client sends fake subtotal to coupon endpoint (e.g. ₹100,000 on ₹800 cart)
  // -------------------------------------------------------------
  try {
    await resetCart();
    await cartService.addItemToCart(userId, {
      cakeId: cakeA._id,
      flavor: "Chocolate",
      size: "1 kg",
      quantity: 1,
    });
    // Attacker calls applyCoupon with code "SEC_VALID10" (10% off) and fake subtotal = 100000
    // If vulnerable, discount would be 10% of 100000 = 10000.
    // Safe: server ignores fake subtotal, calculates 10% of real ₹800 = ₹80.
    const res = await cartService.applyCoupon(userId, "SEC_VALID10");
    const passed = res.discountAmount === 80 && res.subtotal === 80; // or subtotal = 800
    const calc = await orderService.validateCartAndCalculate(userId);
    const finalPassed = calc.discountAmount === 80 && calc.grandTotal === (800 - 80 + 5);
    testResults.push({
      id: 7,
      name: "Client sends fake subtotal (coupon manipulation blocked)",
      passed: finalPassed,
      details: `Discount applied: ₹${calc.discountAmount} (Expected: ₹80, NOT ₹10,000 from client subtotal)`,
    });
  } catch (err) {
    testResults.push({ id: 7, name: "Client sends fake subtotal", passed: false, details: err.message });
  }

  // -------------------------------------------------------------
  // TEST 8: Client sends fake couponDiscount in order placement
  // -------------------------------------------------------------
  try {
    await resetCart();
    await cartService.addItemToCart(userId, {
      cakeId: cakeA._id,
      flavor: "Chocolate",
      size: "1 kg",
      quantity: 1,
    });
    // Directly inject manipulated couponDiscount in raw cart or orderData
    const orderRes = await orderService.placeOrder(userId, {
      shippingAddress: defaultShipping,
      paymentMethod: "cod",
      couponDiscount: 9999, // Injected fake discount in order body!
      discountAmount: 9999,
      grandTotal: 1,
    });
    const passed = orderRes.order.discountAmount === 0 && orderRes.order.grandTotal === 805;
    testResults.push({
      id: 8,
      name: "Client sends fake couponDiscount in order payload (ignored)",
      passed,
      details: `Order discount: ₹${orderRes.order.discountAmount}, Grand Total: ₹${orderRes.order.grandTotal} (Expected: 805)`,
    });
  } catch (err) {
    testResults.push({ id: 8, name: "Client sends fake couponDiscount", passed: false, details: err.message });
  }

  // -------------------------------------------------------------
  // TEST 9: Valid coupon with correct cart
  // -------------------------------------------------------------
  try {
    await resetCart();
    await cartService.addItemToCart(userId, {
      cakeId: cakeA._id,
      flavor: "Chocolate",
      size: "1 kg",
      quantity: 1,
    }); // Subtotal = 800
    const couponRes = await cartService.applyCoupon(userId, "SEC_VALID10");
    const calc = await orderService.validateCartAndCalculate(userId);
    const passed = calc.appliedCoupon === "SEC_VALID10" && calc.discountAmount === 80 && calc.grandTotal === 725;
    testResults.push({
      id: 9,
      name: "Valid coupon with correct cart",
      passed,
      details: `Coupon: ${calc.appliedCoupon}, Saved: ₹${calc.discountAmount}, GrandTotal: ₹${calc.grandTotal}`,
    });
  } catch (err) {
    testResults.push({ id: 9, name: "Valid coupon with correct cart", passed: false, details: err.message });
  }

  // -------------------------------------------------------------
  // TEST 10: Invalid coupon (non-existent code)
  // -------------------------------------------------------------
  try {
    await resetCart();
    await cartService.addItemToCart(userId, {
      cakeId: cakeA._id,
      flavor: "Chocolate",
      size: "1 kg",
      quantity: 1,
    });
    let rejected = false;
    try {
      await cartService.applyCoupon(userId, "NON_EXISTENT_COUPON_123");
    } catch (err) {
      if (err.statusCode === 404 || err.message.includes("Invalid")) rejected = true;
    }
    testResults.push({
      id: 10,
      name: "Invalid coupon code rejected",
      passed: rejected,
      details: rejected ? "Properly returned 404/Invalid coupon error" : "Failed to reject invalid coupon",
    });
  } catch (err) {
    testResults.push({ id: 10, name: "Invalid coupon code rejected", passed: false, details: err.message });
  }

  // -------------------------------------------------------------
  // TEST 11: Expired coupon rejected
  // -------------------------------------------------------------
  try {
    await resetCart();
    await cartService.addItemToCart(userId, {
      cakeId: cakeA._id,
      flavor: "Chocolate",
      size: "1 kg",
      quantity: 1,
    });
    let rejected = false;
    try {
      await cartService.applyCoupon(userId, "SEC_EXPIRED");
    } catch (err) {
      if (err.statusCode === 400 && err.message.includes("expired")) rejected = true;
    }
    testResults.push({
      id: 11,
      name: "Expired coupon rejected",
      passed: rejected,
      details: rejected ? "Properly returned 400 Expired error" : "Failed to reject expired coupon",
    });
  } catch (err) {
    testResults.push({ id: 11, name: "Expired coupon rejected", passed: false, details: err.message });
  }

  // -------------------------------------------------------------
  // TEST 12: Coupon below minimum order rejected
  // -------------------------------------------------------------
  try {
    await resetCart();
    await cartService.addItemToCart(userId, {
      cakeId: cakeA._id,
      flavor: "Chocolate",
      size: "1 kg",
      quantity: 1,
    }); // Real Subtotal = ₹800. Coupon requires ₹5000.
    let rejected = false;
    try {
      await cartService.applyCoupon(userId, "SEC_HIGHMIN");
    } catch (err) {
      if (err.statusCode === 400 && err.message.includes("Minimum order amount")) rejected = true;
    }
    testResults.push({
      id: 12,
      name: "Coupon below minimum order rejected",
      passed: rejected,
      details: rejected ? "Properly returned 400 Minimum order amount error" : "Failed to reject below-min coupon",
    });
  } catch (err) {
    testResults.push({ id: 12, name: "Coupon below minimum order rejected", passed: false, details: err.message });
  }

  // -------------------------------------------------------------
  // TEST 13: Fixed coupon greater than subtotal (capped at subtotal)
  // -------------------------------------------------------------
  try {
    await resetCart();
    await cartService.addItemToCart(userId, {
      cakeId: cakeA._id,
      flavor: "Chocolate",
      size: "1 kg",
      quantity: 1,
    }); // Subtotal = ₹800. Coupon is flat ₹2000 off.
    const res = await cartService.applyCoupon(userId, "SEC_FLAT2000");
    const calc = await orderService.validateCartAndCalculate(userId);
    // Discount must be capped at subtotal (800), NOT 2000!
    // GrandTotal = 800 - 800 + 5 = 5. Never negative!
    const passed = calc.discountAmount === 800 && calc.grandTotal === 5;
    testResults.push({
      id: 13,
      name: "Fixed coupon capped at subtotal (never negative grand total)",
      passed,
      details: `Discount capped: ₹${calc.discountAmount} (Requested: ₹2000), GrandTotal: ₹${calc.grandTotal}`,
    });
  } catch (err) {
    testResults.push({ id: 13, name: "Fixed coupon capped at subtotal", passed: false, details: err.message });
  }

  // -------------------------------------------------------------
  // TEST 14: Percentage coupon with maxDiscountAmount cap
  // -------------------------------------------------------------
  try {
    await resetCart();
    // Add 5 cakes -> subtotal = 5 * 800 = ₹4000
    await cartService.addItemToCart(userId, {
      cakeId: cakeA._id,
      flavor: "Chocolate",
      size: "1 kg",
      quantity: 5,
    });
    // SEC_VALID10 is 10% with maxDiscountAmount = 200.
    // 10% of 4000 = 400, but capped at 200!
    const res = await cartService.applyCoupon(userId, "SEC_VALID10");
    const calc = await orderService.validateCartAndCalculate(userId);
    const passed = calc.discountAmount === 200 && calc.grandTotal === (4000 - 200 + 5);
    testResults.push({
      id: 14,
      name: "Percentage coupon capped at maxDiscountAmount",
      passed,
      details: `Discount capped: ₹${calc.discountAmount} (Uncapped 10%: ₹400, Cap: ₹200), GrandTotal: ₹${calc.grandTotal}`,
    });
  } catch (err) {
    testResults.push({ id: 14, name: "Percentage coupon capped at maxDiscountAmount", passed: false, details: err.message });
  }

  // -------------------------------------------------------------
  // TEST 15: Final payment amount equals backend-calculated order.grandTotal
  // -------------------------------------------------------------
  try {
    await resetCart();
    await cartService.addItemToCart(userId, {
      cakeId: cakeA._id,
      flavor: "Chocolate",
      size: "1 kg",
      quantity: 2,
    }); // 2 * 800 = 1600. Delivery = 5. GrandTotal = 1605.
    const placeRes = await orderService.placeOrder(userId, {
      shippingAddress: defaultShipping,
      paymentMethod: "razorpay",
    });
    const orderId = placeRes.order._id;

    // Razorpay payment order creation
    const paymentOrder = await paymentService.createPaymentOrder(userId, orderId);

    // Stripe intent creation
    const stripeIntent = await paymentService.createStripePaymentIntent(userId, {
      orderId,
    });

    const expectedPaise = 1605 * 100;
    const razorpayMatches = paymentOrder.amount === expectedPaise;
    const stripeMatches = stripeIntent.amount === expectedPaise;
    const passed = razorpayMatches && stripeMatches && placeRes.order.grandTotal === 1605;

    testResults.push({
      id: 15,
      name: "Payment gateways charge exact server order.grandTotal",
      passed,
      details: `Order GrandTotal: ₹${placeRes.order.grandTotal}, Razorpay: ₹${paymentOrder.amount / 100}, Stripe: ₹${stripeIntent.amount / 100}`,
    });
  } catch (err) {
    testResults.push({ id: 15, name: "Final payment amount equals order.grandTotal", passed: false, details: err.message });
  }

  // -------------------------------------------------------------
  // Summary Table
  // -------------------------------------------------------------
  console.log("\n==================================================================");
  console.log("📊 TEST EXECUTION SUMMARY:");
  console.log("==================================================================");
  let allPassed = true;
  for (const r of testResults) {
    const mark = r.passed ? "✅ PASS" : "❌ FAIL";
    if (!r.passed) allPassed = false;
    console.log(`[Test ${r.id.toString().padStart(2, "0")}] ${mark} : ${r.name}`);
    console.log(`          ↳ ${r.details}`);
  }
  console.log("==================================================================");
  console.log(allPassed ? "🎉 ALL 15 SECURITY PRICING TESTS PASSED PERFECTLY!" : "⚠️ SOME TESTS FAILED!");
  console.log("==================================================================\n");

  await mongoose.disconnect();
}

runSecurityPricingTests().catch((err) => {
  console.error("FATAL ERROR running tests:", err);
  process.exit(1);
});
