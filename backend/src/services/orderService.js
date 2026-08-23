const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Cake = require("../models/Cake");
const ApiError = require("../utils/ApiError");

const DELIVERY_CHARGE = 5.0;

/**
 * Helper: Reduce stock for product variants based on ordered items
 */
const reduceStock = async (items) => {
  for (const item of items) {
    if (!item.cake) continue;
    const cake = await Cake.findById(item.cake);
    if (!cake) continue;

    // Find the variant matching the flavor and size
    const variant = cake.variants.find(
      (v) => v.flavor === item.flavor && v.size === item.size
    );

    if (variant) {
      variant.stock = Math.max(0, variant.stock - item.quantity);
      await cake.save();
    }
  }
};

/**
 * Validate cart items availability and calculate amounts
 */
const validateCartAndCalculate = async (userId) => {
  // Load cart with populated cake info
  const cart = await Cart.findOne({ user: userId }).populate(
    "items.cake",
    "name images slug status variants"
  );

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty");
  }

  // Validate each item
  for (const item of cart.items) {
    if (!item.cake) {
      throw new ApiError(400, `Product no longer available`);
    }

    if (item.cake.status !== "active") {
      throw new ApiError(400, `${item.cake.name} is currently unavailable`);
    }

    // Check variant availability
    const variant = item.cake.variants.find(
      (v) => v.flavor === item.flavor && v.size === item.size
    );

    if (!variant) {
      throw new ApiError(
        400,
        `Selected variant of ${item.cake.name} is no longer available`
      );
    }

    if (variant.stock < item.quantity) {
      throw new ApiError(
        400,
        `Only ${variant.stock} units of ${item.cake.name} (${variant.flavor}, ${variant.size}) available`
      );
    }
  }

  // Build order item snapshots (frozen copies)
  const items = cart.items.map((item) => ({
    cake: item.cake._id,
    name: item.cake.name,
    image: item.cake.images?.[0] || item.cake.thumbnail || "",
    flavor: item.flavor,
    size: item.size,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discount: item.discount,
    isEggless: item.isEggless,
    cakeMessage: item.cakeMessage,
    photoUrl: item.photoUrl,
    deliveryDate: item.deliveryDate,
    deliveryTimeSlot: item.deliveryTimeSlot,
    addons: item.addons,
  }));

  // Calculate pricing (mirrors Checkout.jsx / useCart values)
  const subtotal = items.reduce((sum, item) => {
    const discountedPrice = item.unitPrice * (1 - item.discount / 100);
    return sum + discountedPrice * item.quantity;
  }, 0);

  const discountAmount = cart.couponDiscount || 0;
  const taxAmount = 0; // Add tax calculation if needed
  const grandTotal = subtotal - discountAmount + DELIVERY_CHARGE + taxAmount;

  return {
    cart,
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    deliveryCharge: DELIVERY_CHARGE,
    taxAmount,
    grandTotal: Math.round(grandTotal * 100) / 100,
  };
};

/**
 * Place an order
 * Creates a pending order. Payment flow determined by payment method.
 * - COD: Confirms immediately and clears cart
 * - Online: Creates order, returns order ID for payment processing
 */
const placeOrder = async (userId, orderData) => {
  const { shippingAddress, paymentMethod = "cod" } = orderData;

  // Validate shipping address
  if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone) {
    throw new ApiError(400, "Valid shipping address is required");
  }

  // Validate cart and calculate amounts (server-side calculation)
  const calculation = await validateCartAndCalculate(userId);

  const orderPayload = {
    user: userId,
    items: calculation.items,
    shippingAddress,
    paymentMethod,
    subtotal: calculation.subtotal,
    discountAmount: calculation.discountAmount,
    deliveryCharge: calculation.deliveryCharge,
    taxAmount: calculation.taxAmount,
    grandTotal: calculation.grandTotal,
    appliedCoupon: calculation.cart.appliedCoupon || "",
    orderStatus: "pending",
    paymentStatus: "pending",
  };

  // If COD, clear cart and reduce stock immediately
  if (paymentMethod === "cod") {
    orderPayload.orderStatus = "confirmed";
    orderPayload.paymentStatus = "pending"; // Will be marked paid on delivery

    const order = await Order.create(orderPayload);

    // Reduce stock
    await reduceStock(calculation.items);

    // Clear cart
    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [], appliedCoupon: "", couponDiscount: 0 }
    );

    return { 
      order,
      requiresPayment: false,
      message: "Order placed successfully with Cash on Delivery" 
    };
  }

  // If Online payment (card/upi), create order but don't clear cart or reduce stock yet
  // Payment service will handle the rest
  const order = await Order.create(orderPayload);

  return { 
    order,
    requiresPayment: true,
    message: "Order created. Please complete payment." 
  };
};

/**
 * Get all orders for a user
 */
const getUserOrders = async (userId) => {
  return await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .select("-__v")
    .lean();
};

/**
 * Get single order by orderNumber — used in TrackOrder.jsx
 */
const getOrderByNumber = async (orderNumber) => {
  const order = await Order.findOne({ orderNumber: orderNumber.toUpperCase() })
    .select("-__v")
    .lean();
  if (!order) throw new ApiError(404, "Order not found");
  return order;
};

/**
 * Get single order by ID
 */
const getOrderById = async (orderId, userId = null) => {
  const order = await Order.findById(orderId).select("-__v").lean();
  
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // If userId provided, verify ownership
  if (userId && order.user.toString() !== userId.toString()) {
    throw new ApiError(403, "Access denied");
  }

  return order;
};

/**
 * Admin: Get all orders
 */
const getAllOrders = async (query = {}) => {
  const { status, page = 1, limit = 20 } = query;
  const filter = {};

  if (status) {
    filter.orderStatus = status;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  };
};

/**
 * Admin: Update order status
 */
const updateOrderStatus = async (orderId, status) => {
  const validStatuses = [
    "pending",
    "confirmed",
    "preparing",
    "baking",
    "packed",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "returned",
    "refunded",
  ];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    { orderStatus: status },
    { new: true }
  );
  if (!order) throw new ApiError(404, "Order not found");
  return order;
};

module.exports = {
  placeOrder,
  validateCartAndCalculate,
  getUserOrders,
  getOrderByNumber,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  reduceStock,
};
