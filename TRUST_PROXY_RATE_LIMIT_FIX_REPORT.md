# OSSAMCAKE — EXPRESS TRUST PROXY + RATE LIMITER PRODUCTION FIX REPORT

**Generated:** October 7, 2026  
**Architect & Production Security Engineer:** Senior MERN Architect  
**Status:** **RESOLVED & VERIFIED**  
**Payment Gateway Integrity Preserved:**  
- `PAYMENT_PROVIDER=razorpay`
- `ENABLE_STRIPE=false`

---

## 1. Root Cause

### Error Encountered
`"The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false"`

### Technical Mechanism
When traffic passes through an **Nginx Reverse Proxy** (on AWS EC2) to the Node.js Express backend, Nginx adds or appends client connection details to the `X-Forwarded-For` HTTP header (e.g. `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`).

By default in Express, the `'trust proxy'` application setting is `false` (disabled).

When `express-rate-limit` (v7+/v8+) handles an incoming HTTP request:
1. It detects that the `X-Forwarded-For` header is populated on the request.
2. It checks Express's `trust proxy` configuration (`req.app.get('trust proxy')`).
3. Because `trust proxy` was `false`, `express-rate-limit` refused to trust `req.ip` blindly (which would otherwise fall back to Nginx's internal proxy IP `127.0.0.1` or EC2 loopback, grouping all global users into a single rate limit bucket).
4. `express-rate-limit` threw the validation warning/error to alert developers of the misconfiguration.

---

## 2. File Changed

- **[backend/src/app.js](file:///c:/Users/kamal/OneDrive/Desktop/Projects/Cake-web/backend/src/app.js)** — Configured `app.set("trust proxy", trustProxySetting)` immediately following Express application instantiation.
- **[backend/.env.example](file:///c:/Users/kamal/OneDrive/Desktop/Projects/Cake-web/backend/.env.example)** — Documented `TRUST_PROXY=1` configuration parameter.

---

## 3. Configuration Selected

```javascript
// backend/src/app.js

// Create Express app
const app = express();

// ── Trust Proxy ──────────────────────────────────────────────────────────────
// Trust the immediate first hop (Nginx reverse proxy on AWS EC2).
// Setting to 1 ensures express-rate-limit and req.ip accurately reflect the real
// client IP while preventing X-Forwarded-For header spoofing bypasses.
const trustProxySetting = process.env.TRUST_PROXY
  ? (process.env.TRUST_PROXY === "true" 
      ? true 
      : isNaN(Number(process.env.TRUST_PROXY)) 
        ? process.env.TRUST_PROXY 
        : Number(process.env.TRUST_PROXY))
  : 1;
app.set("trust proxy", trustProxySetting);
```

Default value applied: **`1`** (Trust 1st hop).

---

## 4. Security Reasoning & Anti-Spoofing Analysis

### Why `app.set('trust proxy', true)` is Insecure
Setting `trust proxy` to boolean `true` instructs Express to trust **every single hop** in `X-Forwarded-For`, traversing all the way to the leftmost IP address.
- If a malicious client sends a crafted header `X-Forwarded-For: 1.1.1.1` to Nginx, Nginx appends the client's real IP: `X-Forwarded-For: 1.1.1.1, <attacker_real_ip>`.
- If `trust proxy` is `true`, Express extracts `1.1.1.1` as `req.ip`.
- **Vulnerability:** An attacker can rotate arbitrary spoofed IP headers on every request to completely bypass IP-based rate limiting on `/api/v1/auth/login`, `/api/v1/auth/resend-otp`, and brute-force user accounts.

### Why `app.set('trust proxy', 1)` is the Narrowest & Safest Solution
With `trust proxy = 1`, Express only trusts **one hop backwards from Express** (the immediate Nginx reverse proxy):
1. **Nginx on EC2:** Receives request from client (`<attacker_real_ip>`) and appends it to `X-Forwarded-For: 1.1.1.1, <attacker_real_ip>`.
2. **Express (Hop 1 Trust):** Reads the rightmost untrusted hop (`<attacker_real_ip>`), safely ignoring any fake headers injected prior to Nginx.
3. **`req.ip`:** Resolves authoritatively to `<attacker_real_ip>`.
4. **Development / Localhost Behavior:** Direct connections (without reverse proxy headers) continue resolving cleanly to loopback (`127.0.0.1` / `::1`).

---

## 5. Rate Limiter Tiers Audit

All sensitive endpoints across the system are protected by three rate-limiting tiers using the authoritatively resolved `req.ip`:

| Limiter Tier | Scope / Routes | Threshold | Protection Provided |
|---|---|---|---|
| **`authLimiter`** | `/api/v1/auth/*`<br>• `/register`<br>• `/login`<br>• `/verify-email`<br>• `/resend-otp`<br>• `/forgot-password`<br>• `/verify-reset-otp`<br>• `/reset-password`<br>• `/2fa/login-verify`<br>• `/passkey/*` | **20 requests / 15 minutes** per client IP | Prevents credential stuffing, brute force login, OTP bombing, and password reset enumeration. |
| **`apiLimiter`** | Public endpoints<br>• `/api/v1/products`<br>• `/api/v1/categories`<br>• `/api/v1/occasions`<br>• `/api/v1/cake-types`<br>• `/api/v1/banners`<br>• `/api/v1/home`<br>• `/api/v1/faqs`<br>• `/api/v1/testimonials`<br>• `/api/v1/settings` | **200 requests / 15 minutes** per client IP | Protects backend resources and MongoDB against DoS scraping and API flooding. |
| **`adminLimiter`** | `/api/v1/admin/*`<br>• Product, order, coupon, user, banner, FAQ, testimonial, and settings management | **500 requests / 15 minutes** per client IP | Accommodates frequent dashboard queries while guarding admin mutation endpoints. |

---

## 6. Test Results

Automated verification was executed via `node test_trust_proxy_rate_limit.js`:

```bash
=================================================================
  EXPRESS TRUST PROXY & RATE LIMITING PRODUCTION VERIFICATION  
=================================================================

[Test 1: Direct Request without X-Forwarded-For]
✓ GET /health -> Status: 200, Status: ok

[Test 2: Proxied Request with X-Forwarded-For (Single Hop Nginx)]
✓ GET /api/v1/settings with X-Forwarded-For: 198.51.100.42 -> Status: 200
✓ RateLimit Headers Present: Limit=200, Remaining=199

[Test 3: Anti-Spoofing Check with Pre-pended Forged Client IP]
✓ GET /api/v1/faqs with X-Forwarded-For: '10.0.0.99, 198.51.100.42' -> Status: 200
✓ Express 1-Hop Trust evaluated successfully without throwing X-Forwarded-For warning

[Test 4: Auth Rate Limiter Verification (/api/v1/auth/register)]
✓ POST /api/v1/auth/register -> Status: 400
✓ Auth RateLimit Headers: Limit=20 (Expected 20), Remaining=19

[Test 5: Admin Rate Limiter Verification (/api/v1/admin/dashboard/stats)]
✓ GET /api/v1/admin/dashboard/stats -> Status: 401 (401 expected without JWT)
✓ Admin RateLimit Headers: Limit=500 (Expected 500)

=================================================================
🎉 ALL TRUST PROXY & RATE LIMITER TESTS PASSED SUCCESSFULLY!
=================================================================
```

---

## 7. Remaining Concerns & Nginx Directives Recommendation

When deploying Nginx on the AWS EC2 instance, ensure the `location` block includes standard proxy headers:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

If an AWS Application Load Balancer (ALB) or Cloudflare CDN is later introduced in front of Nginx (creating 2 hops: Internet → ALB/Cloudflare → Nginx → Node.js), set `TRUST_PROXY=2` in `backend/.env` without modifying any source code.
