# ✅ Razorpay Activation Checklist

## 🎯 Quick Status Check

Current Status: **MOCK MODE** ✅  
Ready to Activate: **YES** ✅  
Time to Activate: **5 minutes** ⏱️

---

## 📋 Step-by-Step Activation

### ☐ Step 1: Create Razorpay Account (2 minutes)

1. ☐ Visit https://dashboard.razorpay.com/signup
2. ☐ Sign up with your email
3. ☐ Verify your email
4. ☐ Complete basic profile

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Completed

---

### ☐ Step 2: Get API Keys (1 minute)

1. ☐ Log in to Razorpay Dashboard
2. ☐ Go to **Settings** → **API Keys**
3. ☐ Switch to **Test Mode** toggle (top right)
4. ☐ Click **Generate Test Key**
5. ☐ Copy **Key ID** (starts with `rzp_test_`)
6. ☐ Copy **Key Secret**

**Key ID**: `rzp_test_________________`  
**Key Secret**: `____________________`

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Completed

---

### ☐ Step 3: Update Environment File (30 seconds)

1. ☐ Open `backend/.env`
2. ☐ Find the Razorpay section (bottom of file)
3. ☐ Paste your Key ID
4. ☐ Paste your Key Secret
5. ☐ Save the file

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Completed

---

### ☐ Step 4: Install Razorpay SDK (30 seconds)

```bash
cd backend
npm install razorpay
```

Expected output:
```
+ razorpay@2.x.x
added 1 package
```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Completed

---

### ☐ Step 5: Activate Real Integration (1 minute)

Open `backend/src/services/razorpay.service.js`

**UNCOMMENT these 5 sections:**

#### 5.1 Initialize Razorpay (Line 35-39)
☐ Uncomment:
```javascript
const Razorpay = require("razorpay");
this.razorpayInstance = new Razorpay({
  key_id: this.keyId,
  key_secret: this.keySecret,
});
```

#### 5.2 Create Order (Line 95-97)
☐ Uncomment:
```javascript
const order = await this.razorpayInstance.orders.create(options);
return order;
```

#### 5.3 Fetch Payment (Line 158-160)
☐ Uncomment:
```javascript
const payment = await this.razorpayInstance.payments.fetch(paymentId);
return payment;
```

#### 5.4 Initiate Refund (Line 236-241)
☐ Uncomment:
```javascript
const refund = await this.razorpayInstance.payments.refund(paymentId, {
  amount: amount,
  notes: notes,
});
return refund;
```

#### 5.5 Capture Payment (Line 273-277)
☐ Uncomment:
```javascript
const payment = await this.razorpayInstance.payments.capture(
  paymentId,
  amount
);
return payment;
```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Completed

---

### ☐ Step 6: Restart Server (30 seconds)

```bash
cd backend
npm run dev
```

**Look for this message:**
```
✅ Razorpay Service: Configured and ready
```

**Did you see it?**  
☐ Yes, I saw it! → Continue to Step 7  
☐ No, I saw a warning → Check Steps 2 & 3 again

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Completed

---

### ☐ Step 7: Test Payment (2 minutes)

#### 7.1 Frontend Test
1. ☐ Start frontend: `cd frontend && npm run dev`
2. ☐ Log in to your account
3. ☐ Add items to cart
4. ☐ Go to checkout
5. ☐ Select "Card / UPI" payment method
6. ☐ Click "Place Order"

#### 7.2 Payment Modal Opens
☐ Razorpay modal opened successfully

#### 7.3 Use Test Card
Use this card for successful payment:
- **Card Number**: `4111 1111 1111 1111`
- **Expiry**: Any future date (e.g., `12/28`)
- **CVV**: Any 3 digits (e.g., `123`)
- **Name**: Any name

☐ Payment succeeded  
☐ Order confirmed  
☐ Cart cleared  
☐ Stock reduced

#### 7.4 Test Failure (Optional)
Use this card for failed payment:
- **Card Number**: `4000 0000 0000 0002`

☐ Payment failed correctly  
☐ Error message shown  
☐ Order still pending

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Completed

---

## 🎉 Activation Complete!

### ✅ Verification Checklist

Mark each as you verify:

☐ Server starts without errors  
☐ Console shows "Razorpay Service: Configured and ready"  
☐ Payment modal opens when placing order  
☐ Test card payment succeeds  
☐ Order gets confirmed after payment  
☐ Cart clears after successful payment  
☐ Stock reduces after successful payment  
☐ Payment appears in Razorpay dashboard  
☐ Failed payment test works correctly

**All checked?** Congratulations! 🎊

---

## 🚀 Optional: Configure Webhooks

Want automatic payment updates?

### ☐ Step 1: Configure Webhook URL

1. ☐ Go to Razorpay Dashboard → **Settings** → **Webhooks**
2. ☐ Click **Create Webhook**
3. ☐ Add your webhook URL:
   - Dev: `http://your-public-url/api/v1/payments/webhook`
   - Prod: `https://yourdomain.com/api/v1/payments/webhook`
4. ☐ Select events:
   - ☐ payment.authorized
   - ☐ payment.captured
   - ☐ payment.failed
5. ☐ Click **Create**
6. ☐ Copy **Webhook Secret**

### ☐ Step 2: Add Webhook Secret

Add to `backend/.env`:
```env
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### ☐ Step 3: Test Webhook

1. ☐ Make a test payment
2. ☐ Check server logs for webhook event
3. ☐ Verify payment status updated

---

## 🌐 Going Live (Later)

When ready for production:

### ☐ Production Checklist

1. ☐ Complete KYC verification on Razorpay
2. ☐ Switch to **Live Mode** in Razorpay dashboard
3. ☐ Generate **Live Keys** (starts with `rzp_live_`)
4. ☐ Update `.env` with live keys
5. ☐ Update webhook URL to production domain
6. ☐ Test with small real amounts
7. ☐ Set up monitoring and alerts
8. ☐ Document payment support process
9. ☐ Train support team
10. ☐ Go live! 🚀

---

## ❓ Troubleshooting

### Issue: "Razorpay is not configured yet"

**Check:**
- ☐ `.env` file has both RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
- ☐ No extra spaces in the values
- ☐ Server was restarted after adding credentials
- ☐ Keys start with `rzp_test_` or `rzp_live_`

### Issue: "Failed to load Razorpay SDK"

**Check:**
- ☐ Internet connection is working
- ☐ Browser can access https://checkout.razorpay.com/v1/checkout.js
- ☐ No ad blockers blocking Razorpay
- ☐ Browser console for errors

### Issue: "Payment verification failed"

**Check:**
- ☐ RAZORPAY_KEY_SECRET is correct
- ☐ No extra spaces in secret
- ☐ Order ID matches in database
- ☐ Server logs for detailed error

### Issue: Webhook not working

**Check:**
- ☐ Webhook URL is publicly accessible (use ngrok for dev)
- ☐ RAZORPAY_WEBHOOK_SECRET is set
- ☐ Webhook logs in Razorpay dashboard
- ☐ Server logs for incoming webhooks

---

## 📞 Need Help?

- **Documentation**: See `RAZORPAY_INTEGRATION_GUIDE.md`
- **Quick Start**: See `RAZORPAY_QUICK_START.md`
- **Examples**: See `frontend/PAYMENT_INTEGRATION_EXAMPLE.md`
- **Razorpay Docs**: https://razorpay.com/docs/
- **Razorpay Support**: support@razorpay.com

---

## 📊 Progress Tracker

**Overall Progress:**

- [ ] Step 1: Create Account (0%)
- [ ] Step 2: Get Keys (0%)
- [ ] Step 3: Update .env (0%)
- [ ] Step 4: Install SDK (0%)
- [ ] Step 5: Uncomment Code (0%)
- [ ] Step 6: Restart Server (0%)
- [ ] Step 7: Test Payment (0%)

**Completion**: 0% → 100% 🎯

---

## 🎓 What You'll Learn

By completing this checklist, you'll understand:

- ✅ How to integrate Razorpay
- ✅ How payment gateways work
- ✅ HMAC signature verification
- ✅ Secure payment processing
- ✅ Webhook implementation
- ✅ Error handling in payments
- ✅ Production payment systems

---

## 🏆 Achievement Unlocked

Once complete, you'll have:

- ✅ Production-ready payment system
- ✅ Support for multiple payment methods
- ✅ Secure payment verification
- ✅ Automatic stock management
- ✅ Failed payment handling
- ✅ Refund support
- ✅ Payment analytics
- ✅ Webhook integration

---

**Ready to start?** Begin with Step 1! 🚀

**Estimated Time**: 5-10 minutes  
**Difficulty**: Easy  
**Reward**: Fully functional payment system 💳
