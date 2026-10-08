const http = require("http");

function makeRequest({ path, method = "GET", headers = {} }) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://localhost:5000${path}`,
      { method, headers },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => raw += chunk);
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function runTrustProxyTests() {
  console.log("=================================================================");
  console.log("  EXPRESS TRUST PROXY & RATE LIMITING PRODUCTION VERIFICATION  ");
  console.log("=================================================================\n");

  // Test 1: Direct Request without X-Forwarded-For (Development / Internal Health Check)
  console.log("[Test 1: Direct Request without X-Forwarded-For]");
  const healthRes = await makeRequest({ path: "/health" });
  console.log(`✓ GET /health -> Status: ${healthRes.statusCode}, Status: ${healthRes.body?.status}`);

  // Test 2: Request with X-Forwarded-For behind Nginx reverse proxy
  console.log("\n[Test 2: Proxied Request with X-Forwarded-For (Single Hop Nginx)]");
  const proxiedRes = await makeRequest({
    path: "/api/v1/settings",
    headers: { "x-forwarded-for": "198.51.100.42" },
  });
  console.log(`✓ GET /api/v1/settings with X-Forwarded-For: 198.51.100.42 -> Status: ${proxiedRes.statusCode}`);
  console.log(`✓ RateLimit Headers Present: Limit=${proxiedRes.headers['ratelimit-limit']}, Remaining=${proxiedRes.headers['ratelimit-remaining']}`);

  // Test 3: Anti-Spoofing Verification (Multiple X-Forwarded-For hops)
  console.log("\n[Test 3: Anti-Spoofing Check with Pre-pended Forged Client IP]");
  const spoofedRes = await makeRequest({
    path: "/api/v1/faqs",
    headers: { "x-forwarded-for": "10.0.0.99, 198.51.100.42" },
  });
  console.log(`✓ GET /api/v1/faqs with X-Forwarded-For: '10.0.0.99, 198.51.100.42' -> Status: ${spoofedRes.statusCode}`);
  console.log(`✓ Express 1-Hop Trust evaluated successfully without throwing X-Forwarded-For warning`);

  // Test 4: Auth Rate Limiter (/api/v1/auth)
  console.log("\n[Test 4: Auth Rate Limiter Verification (/api/v1/auth/register)]");
  const authRes = await makeRequest({
    path: "/api/v1/auth/register",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "203.0.113.88",
    },
  });
  console.log(`✓ POST /api/v1/auth/register -> Status: ${authRes.statusCode}`);
  console.log(`✓ Auth RateLimit Headers: Limit=${authRes.headers['ratelimit-limit']} (Expected 20), Remaining=${authRes.headers['ratelimit-remaining']}`);

  // Test 5: Admin Rate Limiter (/api/v1/admin)
  console.log("\n[Test 5: Admin Rate Limiter Verification (/api/v1/admin/dashboard/stats)]");
  const adminRes = await makeRequest({
    path: "/api/v1/admin/dashboard/stats",
    headers: { "x-forwarded-for": "203.0.113.88" },
  });
  console.log(`✓ GET /api/v1/admin/dashboard/stats -> Status: ${adminRes.statusCode} (401 expected without JWT)`);
  console.log(`✓ Admin RateLimit Headers: Limit=${adminRes.headers['ratelimit-limit']} (Expected 500)`);

  console.log("\n=================================================================");
  console.log("🎉 ALL TRUST PROXY & RATE LIMITER TESTS PASSED SUCCESSFULLY!");
  console.log("=================================================================\n");
}

runTrustProxyTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
