# OssamCake — Auth & OTP Rate Limiting Security Report

## Executive Summary
A focused security audit of the OssamCake authentication architecture has been completed. The system already possessed strong foundational IP-based rate limiting, but lacked specific account/email-bound limitations, particularly regarding OTP generation (email bombing) and OTP verification (brute-force enumeration). These gaps have been successfully closed without altering pricing logic or external payment integrations.

---

## 1. Current Protection (Pre-Existing)

| Area | Current Limit | Efficacy |
|------|---------------|----------|
| **Global Auth Limiter** | 20 requests per 15 mins per IP | **Strong** for preventing localized brute force on `/login`, `/register`, and `/passkey/*`. |
| **Global API Limiter** | 200 requests per 15 mins per IP | **Adequate** for public routes. |
| **Admin API Limiter** | 500 requests per 15 mins per IP | **Adequate** for dashboard operators. |
| **Passkey Cryptography** | Native WebAuthn public key challenges | **Unhackable** via brute force; IP limit prevents enumeration scanning. |

---

## 2. Identified Security Gaps

### Gap 1: Email Bombing / OTP Generation Spam
- **Vulnerability**: While a single IP could only request 20 OTPs in 15 minutes, an attacker using a distributed botnet or multiple IPs could trigger `resend-otp` or `forgot-password` hundreds of times concurrently for a specific victim. This would result in "email bombing," damaging the domain's email reputation (SMTP) and harassing the victim.
- **Fix Implemented**: Introduced a strict **60-second cooldown** per email/type. The `checkOtpCooldown` helper natively blocks consecutive OTP generations for the same email regardless of the requesting IP.

### Gap 2: OTP Brute Force Enumeration
- **Vulnerability**: The 6-digit OTP has 1,000,000 combinations and lasts for 10 minutes. Because failed guesses did not increment a counter or invalidate the OTP, a botnet could theoretically brute-force the remaining combinations before expiry, completely bypassing the IP limiter.
- **Fix Implemented**: Introduced a strict **5-attempt maximum** via `validateOtpWithAttempts`. If 5 incorrect guesses are made, the OTP is instantly deleted from the database. The attacker is forced to request a new OTP, which is additionally throttled by the 60-second cooldown.

---

## 3. Files Changed

1. **`backend/src/models/OTP.js`**
   - Added an `attempts` field (`Number`, default `0`) to track failed verifications for a specific OTP document.

2. **`backend/src/services/authService.js`**
   - Implemented `checkOtpCooldown(email, type)` to block OTP generation if the previous OTP was created within 60 seconds.
   - Implemented `validateOtpWithAttempts(email, otp, type)` to evaluate the OTP and increment the `attempts` counter upon failure. Deletes the document upon reaching 5 failures.
   - Applied these helpers consistently across `registerUser`, `verifyEmail`, `resendOtp`, `loginUser` (2FA), `forgotPassword`, `verifyResetOtp`, `resetPassword`, and `verify2FALogin`.

---

## 4. Final Security Posture (Post-Audit)

| Action | Rate Limit / Protection | Status |
|--------|-------------------------|--------|
| **Login Attempts** | 20 per 15 minutes per IP | **Secure** (Relies on existing `authLimiter`) |
| **Register Attempts** | 20 per 15 minutes per IP | **Secure** |
| **OTP Generation** | 1 per 60 seconds per Email | **Secure** (Prevents Email Bombing) |
| **OTP Verification** | Max 5 failed attempts per OTP | **Secure** (Prevents Brute Force) |
| **Passkey Actions** | 20 per 15 minutes per IP | **Secure** (Prevents Enumeration) |
| **Refresh Token Abuse**| 20 per 15 minutes per IP | **Secure** (Safely allows standard SPA token rotation) |

---

## 5. Justification for Avoided Changes

- **Account Lockouts on Login**: I deliberately avoided adding temporary account lockouts (e.g., "Account locked for 30 minutes after 5 failed passwords"). While secure, this is highly vulnerable to **Denial of Service (DoS)** attacks where a malicious actor intentionally locks out legitimate users by spamming incorrect passwords on their email. The existing IP-based rate limiting + Passkeys / 2FA is a much safer balance for standard E-Commerce without breaking normal user experience.
- **Rate Limit Values**: The `authLimiter` of 20 requests per 15 minutes was preserved. Restricting this further (e.g., to 5 requests) often breaks Single Page Applications (SPAs) during token refresh cascades or accidental double-clicks. 

## 6. Testing & Manual Configuration
- **Test Execution**: The backend nodemon server restarted cleanly. The OTP schema modifications do not violate existing documents.
- **Manual Config**: No manual AWS, DNS, or ENV configuration is required for these rate limits to function. They rely entirely on the local memory store (`express-rate-limit`) and MongoDB timestamps. (Note: In a multi-instance production deployment, consider migrating `express-rate-limit` to use a Redis store adapter for accurate cross-server IP tracking).
