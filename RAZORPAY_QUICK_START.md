# 🚀 Razorpay Quick Start - 5 Minutes to Live Payments

## Current Status: MOCK MODE ✅

Your payment system is **fully implemented** and working in mock mode. Follow these steps to activate real payments:

---

## Step 1: Get Razorpay Credentials (2 minutes)

1. Visit: https://dashboard.razorpay.com/signup
2. Sign up and verify email
3. Go to: **Settings** → **API Keys** → **Test Mode**
4. Click **Generate Test Key**
5. Copy both keys

---

## Step 2: Add to Environment (30 seconds)

Open `backend/.env` and add:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 3: Install SDK (30 seconds)

```bash
cd backend
npm install razorpay
```

---

## Step 4: Activate Real Integration (1 minute)

Open `backend/src/services/razorpay.service.js`

**Uncomment 5 sections** (search for "UNCOMMENT THIS"):

1. **Line 35-39** - Initialize Razorpay
2. **Line 95-97** - Create Order
3. **Line 158-160** - Fetch Payment
4. **Line 236-241** - Initiate Refund
5. **Line 273-277** - Capture Payment

---

## Step 5: Restart & Test (1 minute)

```bash
cd backend
npm run dev
```

**You should see:**
```
✅ Razorpay Service: Configured and ready
```

**Test with these cards:**
- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

---

## ✅ Done!

You now have a working Razorpay integration!

**What happens next?**
- Users can pay with cards, UPI, wallets, netbanking
- Payments are verified automatically
- Orders are confirmed on successful payment
- Stock is reduced automatically
- Cart is cleared after payment
- Webhooks handle background events

---

## 🔐 For Production (Later)

1. Complete KYC verification on Razorpay
2. Switch to **Live Mode** in dashboard
3. Generate **Live Keys**
4. Update `.env` with live keys
5. Add webhook URL in Razorpay dashboard
6. Add `RAZORPAY_WEBHOOK_SECRET` to `.env`

---

## 📞 Need Help?

- Check: `RAZORPAY_INTEGRATION_GUIDE.md` for detailed documentation
- Razorpay Docs: https://razorpay.com/docs/
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/

---

## 🎯 API Endpoints

**Get Key**:
```
GET /api/v1/payments/key
```

**Create Order**:
```
POST /api/v1/payments/create-order
{ "orderId": "64abc..." }
```

**Verify Payment**:
```
POST /api/v1/payments/verify
{
  "razorpay_order_id": "...",
  "razorpay_payment_id": "...",
  "razorpay_signature": "..."
}
```

---

**That's it! 🎉**

Your payment system is production-ready and waiting for credentials.
