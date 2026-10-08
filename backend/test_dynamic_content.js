require("dotenv").config();
const mongoose = require("mongoose");
const http = require("http");

const FAQ = require("./src/models/FAQ");
const Testimonial = require("./src/models/Testimonial");
const SiteSettings = require("./src/models/SiteSettings");
const siteSettingsService = require("./src/services/siteSettings.service");
const { calculateCartTotals } = require("./src/services/cartService");

const MONGO_URI = process.env.MONGO_URI;

async function runTests() {
  console.log("=== STARTING DYNAMIC CONTENT AUDIT & VERIFICATION TESTS ===\n");
  
  if (MONGO_URI) {
    await mongoose.connect(MONGO_URI);
    console.log("✓ MongoDB Connected");
  }

  // 1. Test Site Settings Service
  console.log("\n[Test 1: SiteSettings Service & Singleton]");
  const settings = await siteSettingsService.getSiteSettings(true);
  console.log("✓ Loaded Settings Business Name:", settings.businessName);
  console.log("✓ Free Shipping Threshold:", settings.shipping?.freeShippingThreshold);
  console.log("✓ Standard Shipping Fee:", settings.shipping?.shippingFee);
  console.log("✓ Announcement Enabled:", settings.announcement?.enabled);

  // 2. Test Cart Pricing Calculation with Dynamic Site Settings
  console.log("\n[Test 2: Authoritative Cart Calculation via Dynamic Settings]");
  const mockCartBelow = {
    items: [
      {
        cake: { status: "active", basePrice: 500, variants: [{ size: "0.5 kg", price: 500 }] },
        size: "0.5 kg",
        quantity: 1,
      }
    ],
    couponDiscount: 0,
  };
  const totalsBelow = calculateCartTotals(mockCartBelow);
  console.log("✓ Subtotal < ₹800 (₹500):", totalsBelow);
  if (totalsBelow.deliveryCharge !== 99) {
    throw new Error(`Expected deliveryCharge 99, got ${totalsBelow.deliveryCharge}`);
  }

  const mockCartAbove = {
    items: [
      {
        cake: { status: "active", basePrice: 1000, variants: [{ size: "1 kg", price: 1000 }] },
        size: "1 kg",
        quantity: 1,
      }
    ],
    couponDiscount: 0,
  };
  const totalsAbove = calculateCartTotals(mockCartAbove);
  console.log("✓ Subtotal >= ₹800 (₹1000):", totalsAbove);
  if (totalsAbove.deliveryCharge !== 0) {
    throw new Error(`Expected deliveryCharge 0, got ${totalsAbove.deliveryCharge}`);
  }

  // 3. Test HTTP Public Endpoints
  console.log("\n[Test 3: HTTP Public Read Endpoints]");
  const checkEndpoint = (path) => {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:5000${path}`, (res) => {
        let raw = "";
        res.on("data", (chunk) => raw += chunk);
        res.on("end", () => {
          try {
            const parsed = JSON.parse(raw);
            resolve({ statusCode: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw });
          }
        });
      }).on("error", reject);
    });
  };

  const publicFaqs = await checkEndpoint("/api/v1/faqs");
  console.log(`✓ GET /api/v1/faqs -> Status: ${publicFaqs.statusCode}, Count: ${publicFaqs.data?.data?.length}`);

  const publicTestimonials = await checkEndpoint("/api/v1/testimonials");
  console.log(`✓ GET /api/v1/testimonials -> Status: ${publicTestimonials.statusCode}, Count: ${publicTestimonials.data?.data?.length}`);

  const publicSettings = await checkEndpoint("/api/v1/settings");
  console.log(`✓ GET /api/v1/settings -> Status: ${publicSettings.statusCode}, Business: ${publicSettings.data?.data?.businessName}`);

  // 4. Test Security: Unauthorized Mutation to Admin Endpoints
  console.log("\n[Test 4: Security & Unauthorized Mutation Protection]");
  const checkPostUnauthorized = (path) => {
    return new Promise((resolve, reject) => {
      const req = http.request(
        `http://localhost:5000${path}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
        (res) => {
          let raw = "";
          res.on("data", (chunk) => raw += chunk);
          res.on("end", () => {
            resolve({ statusCode: res.statusCode, raw });
          });
        }
      );
      req.on("error", reject);
      req.write(JSON.stringify({ test: "hack" }));
      req.end();
    });
  };

  const unauthFaq = await checkPostUnauthorized("/api/v1/admin/faqs");
  console.log(`✓ POST /api/v1/admin/faqs without token -> Status: ${unauthFaq.statusCode} (Expected 401 Unauthorized)`);
  if (unauthFaq.statusCode !== 401) {
    throw new Error(`Security Failure! Expected 401, got ${unauthFaq.statusCode}`);
  }

  const unauthTestimonial = await checkPostUnauthorized("/api/v1/admin/testimonials");
  console.log(`✓ POST /api/v1/admin/testimonials without token -> Status: ${unauthTestimonial.statusCode} (Expected 401 Unauthorized)`);
  if (unauthTestimonial.statusCode !== 401) {
    throw new Error(`Security Failure! Expected 401, got ${unauthTestimonial.statusCode}`);
  }

  console.log("\n=======================================================");
  console.log("🎉 ALL DYNAMIC CONTENT & SECURITY TESTS PASSED!");
  console.log("=======================================================\n");

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error("❌ Test run failed:", err);
  process.exit(1);
});
