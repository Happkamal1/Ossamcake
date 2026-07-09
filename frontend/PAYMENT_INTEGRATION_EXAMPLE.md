# Frontend Payment Integration Example

## 📦 Import Payment Service

```javascript
import paymentService from "@/services/paymentService";
```

---

## 🛒 Example 1: Checkout Page with Payment

```javascript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import paymentService from "@/services/paymentService";
import { toast } from "sonner";

function CheckoutPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card"); // card, upi, cod
  
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      // Validate shipping address
      if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.street) {
        toast.error("Please fill in all required fields");
        return;
      }

      // 1. Create order on backend
      const orderResponse = await axios.post(
        "http://localhost:5000/api/v1/orders",
        {
          shippingAddress,
          paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const { order, requiresPayment } = orderResponse.data.data;

      // 2. If COD, order is already confirmed
      if (!requiresPayment) {
        toast.success("Order placed successfully with Cash on Delivery!");
        navigate(`/orders/${order.orderNumber}`);
        return;
      }

      // 3. If online payment, process payment
      toast.info("Opening payment gateway...");
      
      const paymentResult = await paymentService.processPayment(
        order._id,
        {
          name: user.name,
          email: user.email,
          phone: user.phone,
        }
      );

      // 4. Payment successful
      toast.success("Payment successful! Your order is confirmed.");
      navigate(`/orders/${order.orderNumber}`);
      
    } catch (error) {
      console.error("Checkout error:", error);
      
      if (error.message === "Payment cancelled by user") {
        toast.warning("Payment cancelled. Your order is saved, you can retry payment later.");
      } else {
        toast.error(error.message || "Failed to place order");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      {/* Shipping Address Form */}
      <div className="shipping-form">
        <h2>Shipping Address</h2>
        <input
          type="text"
          placeholder="Full Name"
          value={shippingAddress.name}
          onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={shippingAddress.phone}
          onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
        />
        <input
          type="text"
          placeholder="Street Address"
          value={shippingAddress.street}
          onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
        />
        <input
          type="text"
          placeholder="City"
          value={shippingAddress.city}
          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
        />
        <input
          type="text"
          placeholder="ZIP Code"
          value={shippingAddress.zip}
          onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
        />
      </div>

      {/* Payment Method Selection */}
      <div className="payment-method">
        <h2>Payment Method</h2>
        <label>
          <input
            type="radio"
            name="payment"
            value="card"
            checked={paymentMethod === "card"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Card / UPI / Net Banking
        </label>
        <label>
          <input
            type="radio"
            name="payment"
            value="cod"
            checked={paymentMethod === "cod"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Cash on Delivery
        </label>
      </div>

      {/* Place Order Button */}
      <button 
        onClick={handlePlaceOrder} 
        disabled={loading}
        className="place-order-btn"
      >
        {loading ? "Processing..." : "Place Order"}
      </button>
    </div>
  );
}

export default CheckoutPage;
```

---

## 🔄 Example 2: Retry Failed Payment

```javascript
import { useState } from "react";
import paymentService from "@/services/paymentService";
import { toast } from "sonner";

function OrderDetailsPage({ order }) {
  const [retrying, setRetrying] = useState(false);

  const handleRetryPayment = async () => {
    try {
      setRetrying(true);
      
      // Check if payment can be retried
      const paymentStatus = await paymentService.getPaymentStatus(
        order.paymentTransaction
      );

      if (!paymentStatus.canRetry()) {
        toast.error("Maximum retry attempts exceeded. Please contact support.");
        return;
      }

      // Retry payment
      const paymentOrder = await paymentService.retryPayment(
        order.paymentTransaction
      );

      // Open Razorpay checkout
      await paymentService.openRazorpay({
        orderId: paymentOrder.orderId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        orderNumber: paymentOrder.orderNumber,
        userDetails: {
          name: order.shippingAddress.name,
          email: user.email,
          phone: order.shippingAddress.phone,
        },
        onSuccess: () => {
          toast.success("Payment successful! Order confirmed.");
          window.location.reload();
        },
        onFailure: (error) => {
          toast.error(`Payment failed: ${error.description}`);
        },
      });
      
    } catch (error) {
      toast.error(error.message || "Failed to retry payment");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div>
      {order.paymentStatus === "failed" && (
        <button 
          onClick={handleRetryPayment}
          disabled={retrying}
        >
          {retrying ? "Processing..." : "Retry Payment"}
        </button>
      )}
    </div>
  );
}
```

---

## 📊 Example 3: Payment History

```javascript
import { useState, useEffect } from "react";
import paymentService from "@/services/paymentService";

function PaymentHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: "",
    limit: 20,
  });

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getPaymentHistory(filter);
      setPayments(data);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-history">
      <h1>Payment History</h1>

      {/* Filter */}
      <select 
        value={filter.status} 
        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
      >
        <option value="">All Payments</option>
        <option value="captured">Successful</option>
        <option value="failed">Failed</option>
        <option value="refunded">Refunded</option>
      </select>

      {/* Payment List */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Order</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                <td>{payment.order.orderNumber}</td>
                <td>₹{(payment.amount / 100).toFixed(2)}</td>
                <td>{payment.method || "N/A"}</td>
                <td>
                  <span className={`status-${payment.status}`}>
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

---

## 🎨 Example 4: Payment Status Component

```javascript
import { useState, useEffect } from "react";
import paymentService from "@/services/paymentService";

function PaymentStatus({ paymentId }) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentStatus();
  }, [paymentId]);

  const fetchPaymentStatus = async () => {
    try {
      const data = await paymentService.getPaymentStatus(paymentId);
      setPayment(data);
    } catch (error) {
      console.error("Failed to fetch payment status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading payment status...</div>;
  if (!payment) return <div>Payment not found</div>;

  const getStatusColor = (status) => {
    const colors = {
      created: "blue",
      attempted: "yellow",
      authorized: "orange",
      captured: "green",
      failed: "red",
      refunded: "purple",
      cancelled: "gray",
    };
    return colors[status] || "gray";
  };

  return (
    <div className="payment-status">
      <h3>Payment Status</h3>
      
      <div className="status-badge" style={{ color: getStatusColor(payment.status) }}>
        {payment.status.toUpperCase()}
      </div>

      <div className="payment-details">
        <p><strong>Amount:</strong> ₹{(payment.amount / 100).toFixed(2)}</p>
        <p><strong>Payment ID:</strong> {payment.razorpayPaymentId || "N/A"}</p>
        <p><strong>Method:</strong> {payment.method || "N/A"}</p>
        <p><strong>Date:</strong> {new Date(payment.createdAt).toLocaleString()}</p>
        
        {payment.status === "failed" && (
          <div className="error-details">
            <p><strong>Error:</strong> {payment.errorDescription}</p>
            <p><strong>Reason:</strong> {payment.errorReason}</p>
          </div>
        )}

        {payment.refund && (
          <div className="refund-details">
            <p><strong>Refund Amount:</strong> ₹{(payment.refund.amount / 100).toFixed(2)}</p>
            <p><strong>Refund Status:</strong> {payment.refund.status}</p>
            <p><strong>Reason:</strong> {payment.refund.reason}</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🛡️ Example 5: Payment Configuration Check

```javascript
import { useState, useEffect } from "react";
import paymentService from "@/services/paymentService";

function PaymentMethodSelector() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const data = await paymentService.getConfigStatus();
      setConfig(data.data);
    } catch (error) {
      console.error("Failed to check config:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="payment-methods">
      <h3>Select Payment Method</h3>

      {config.isConfigured ? (
        <>
          <label>
            <input type="radio" name="payment" value="card" />
            Credit/Debit Card
          </label>
          <label>
            <input type="radio" name="payment" value="upi" />
            UPI
          </label>
          <label>
            <input type="radio" name="payment" value="netbanking" />
            Net Banking
          </label>
        </>
      ) : (
        <div className="payment-unavailable">
          <p>⚠️ Online payment is temporarily unavailable.</p>
          <p>Please use Cash on Delivery or contact support.</p>
        </div>
      )}

      <label>
        <input type="radio" name="payment" value="cod" defaultChecked />
        Cash on Delivery
      </label>
    </div>
  );
}
```

---

## 🎯 Key Points

1. **Always handle errors gracefully**
   - Show user-friendly messages
   - Log errors for debugging
   - Provide retry options

2. **Loading states are important**
   - Disable buttons during processing
   - Show loading indicators
   - Prevent double submissions

3. **Security considerations**
   - Never store card details on frontend
   - Use HTTPS in production
   - Validate on backend

4. **User experience**
   - Clear payment status messages
   - Easy retry for failed payments
   - Payment history visibility

5. **Testing**
   - Test with test cards
   - Test payment cancellation
   - Test network failures
   - Test with different payment methods

---

## 📝 Environment Setup

Make sure your frontend `.env` file has:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 🚀 Ready to Use

The `paymentService.js` is already implemented and ready to use. Just import and call the methods as shown in the examples above.

**Available Methods:**
- `processPayment(orderId, userDetails)` - Complete payment flow
- `createPaymentOrder(orderId)` - Create payment order
- `verifyPayment(paymentData)` - Verify payment
- `getPaymentStatus(paymentId)` - Get payment status
- `getPaymentHistory(filters)` - Get payment history
- `retryPayment(paymentId)` - Retry failed payment
- `openRazorpay(options)` - Manual Razorpay integration

Choose the method that fits your use case!
