/**
 * Order Status Constants
 * Matches the TRACKING_STEPS in TrackOrder.jsx on the frontend.
 * Keep in sync if the frontend step labels ever change.
 */
const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  BAKING: "baking",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURNED: "returned",
};

const PAYMENT_STATUS = {
  PENDING: "pending",
  AUTHORIZED: "authorized",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
};

const PAYMENT_METHOD = {
  CARD: "card",
  COD: "cod",
  UPI: "upi",
};

module.exports = { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD };
