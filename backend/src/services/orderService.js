const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Cake = require("../models/Cake");
const Coupon = require("../models/Coupon");
const ApiError = require("../utils/ApiError");
const { resolveAuthoritativeItemPricing, validateAndCalculateCoupon } = require("./cartService");
const siteSettingsService = require("./siteSettings.service");



/**
 * Helper: Restore stock for a product variant (compensation rollback)
 */
const restoreStock = async (cakeId, flavor, size, quantity) => {
  try {
    const qty = Number(quantity) || 1;
    let res = null;
    if (flavor && size) {
      res = await Cake.findOneAndUpdate(
        {
          _id: cakeId,
          variants: {
            $elemMatch: { flavor, size },
          },
        },
        {
          $inc: { "variants.$.stock": qty },
        }
      );
    }
    if (!res && size) {
      res = await Cake.findOneAndUpdate(
        {
          _id: cakeId,
          variants: {
            $elemMatch: { size },
          },
        },
        {
          $inc: { "variants.$.stock": qty },
        }
      );
    }
    if (!res) {
      await Cake.findOneAndUpdate(
        { _id: cakeId },
        {
          $inc: { "variants.0.stock": qty },
        }
      );
    }
  } catch (err) {
    console.error(`Failed to restore stock for cake ${cakeId}:`, err);
  }
};

/**
 * Helper: Atomically reduce stock for product variants based on ordered items
 * Enforces stock >= requestedQuantity and avoids negative stock.
 * Rolls back any partially deducted items if an error occurs.
 */
const reduceStock = async (items) => {
  const successfulDeductions = [];

  try {
    for (const item of items) {
      if (!item.cake) continue;
      const requestedQty = Number(item.quantity) || 1;

      let updateResult = null;

      // 1. Attempt atomic update matching both flavor and size with stock >= requestedQuantity
      if (item.flavor && item.size) {
        updateResult = await Cake.findOneAndUpdate(
          {
            _id: item.cake,
            variants: {
              $elemMatch: {
                flavor: item.flavor,
                size: item.size,
                stock: { $gte: requestedQty },
              },
            },
          },
          {
            $inc: { "variants.$.stock": -requestedQty },
          },
          { returnDocument: "after" }
        );
      }

      // 2. If no match and size is specified, attempt match by size
      if (!updateResult && item.size) {
        updateResult = await Cake.findOneAndUpdate(
          {
            _id: item.cake,
            variants: {
              $elemMatch: {
                size: item.size,
                stock: { $gte: requestedQty },
              },
            },
          },
          {
            $inc: { "variants.$.stock": -requestedQty },
          },
          { returnDocument: "after" }
        );
      }

      // 3. Fallback to default/first variant if applicable
      if (!updateResult) {
        updateResult = await Cake.findOneAndUpdate(
          {
            _id: item.cake,
            "variants.0.stock": { $gte: requestedQty },
          },
          {
            $inc: { "variants.0.stock": -requestedQty },
          },
          { returnDocument: "after" }
        );
      }

      // 4. If updateResult is still null, atomic reduction failed (insufficient stock)
      if (!updateResult) {
        const existingCake = await Cake.findById(item.cake);
        if (!existingCake) {
          throw new ApiError(404, `Product not found for inventory deduction: ${item.name || item.cake}`);
        }

        const matchedVariant = existingCake.variants.find(
          (v) => (v.flavor === item.flavor && v.size === item.size)
        ) || existingCake.variants.find(
          (v) => v.size === item.size
        ) || (existingCake.variants.length > 0 ? existingCake.variants[0] : null);

        const availableStock = matchedVariant ? matchedVariant.stock : 0;
        throw new ApiError(
          400,
          `Insufficient stock for "${existingCake.name}" (${item.flavor || ""} ${item.size || ""}). Requested: ${requestedQty}, Available: ${availableStock}`
        );
      }

      successfulDeductions.push({
        cakeId: item.cake,
        flavor: item.flavor,
        size: item.size,
        quantity: requestedQty,
      });
    }
  } catch (error) {
    // Failure Safety: Roll back all previously deducted items in this transaction
    for (const d of successfulDeductions) {
      await restoreStock(d.cakeId, d.flavor, d.size, d.quantity);
    }
    throw error;
  }
};

/**
 * Validate cart items availability and calculate amounts.
 * NEVER trusts client-provided discount, unitPrice, subtotal, or couponDiscount.
 */
const validateCartAndCalculate = async (userId) => {
  // Load cart with populated cake info
  const cart = await Cart.findOne({ user: userId }).populate(
    "items.cake",
    "name thumbnail gallery slug status variants discount basePrice egglessPremium"
  );

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty");
  }

  // Validate each item
  for (const item of cart.items) {
    if (!item.cake) {
      throw new ApiError(400, "Product no longer available");
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
  // Re-derive price AND product discount strictly from DB Cake and Variant data
  const items = cart.items.map((item) => {
    const pricing = resolveAuthoritativeItemPricing(
      item.cake,
      item.flavor,
      item.size,
      item.isEggless,
      item.addons
    );

    return {
      cake: item.cake._id,
      name: item.cake.name,
      image: item.cake.thumbnail || "",
      flavor: item.flavor || (pricing.variant ? pricing.variant.flavor : ""),
      size: item.size || (pricing.variant ? pricing.variant.size : ""),
      quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
      unitPrice: pricing.unitPrice,     // Server-authoritative price
      discount: pricing.discount,       // Server-authoritative product discount (client ignored)
      isEggless: Boolean(item.isEggless),
      cakeMessage: typeof item.cakeMessage === "string" ? item.cakeMessage : "",
      photoUrl: typeof item.photoUrl === "string" ? item.photoUrl : "",
      deliveryDate: item.deliveryDate,
      deliveryTimeSlot: typeof item.deliveryTimeSlot === "string" ? item.deliveryTimeSlot : "",
      addons: item.addons || {},
    };
  });

  // Calculate pricing strictly from authoritative line items
  const subtotal = items.reduce((sum, item) => {
    const discountedPrice = item.unitPrice * (1 - item.discount / 100);
    return sum + discountedPrice * item.quantity;
  }, 0);

  const roundedSubtotal = Math.round(subtotal * 100) / 100;

  // Authoritatively revalidate and recalculate coupon discount against live subtotal
  let discountAmount = 0;
  let appliedCouponCode = "";

  if (cart.appliedCoupon) {
    try {
      const couponResult = await validateAndCalculateCoupon(
        userId,
        cart.appliedCoupon,
        roundedSubtotal
      );
      discountAmount = couponResult.discountAmount;
      appliedCouponCode = couponResult.coupon.code;
    } catch (err) {
      console.warn(`Coupon "${cart.appliedCoupon}" invalidated during order calculation:`, err.message);
      await Cart.findOneAndUpdate(
        { user: userId },
        { appliedCoupon: "", couponDiscount: 0 }
      );
      discountAmount = 0;
      appliedCouponCode = "";
    }
  }

  const settings = siteSettingsService.getSiteSettingsSync();
  const freeShippingThreshold = settings.shipping?.freeShippingThreshold ?? 800.0;
  const deliveryFee = settings.shipping?.shippingFee ?? 99.0;
  const taxRate = settings.shipping?.taxRate ?? 0.05;

  const deliveryCharge = roundedSubtotal >= freeShippingThreshold ? 0 : deliveryFee;
  const taxAmount = Math.round((roundedSubtotal * taxRate) * 100) / 100;
  
  const grandTotal = Math.max(
    0,
    Math.round((roundedSubtotal - discountAmount + deliveryCharge + taxAmount) * 100) / 100
  );

  return {
    cart,
    items,
    subtotal: roundedSubtotal,
    discountAmount,
    deliveryCharge,
    taxAmount,
    grandTotal,
    appliedCoupon: appliedCouponCode,
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

  // Validate cart and calculate amounts (100% server-side calculation)
  const calculation = await validateCartAndCalculate(userId);

  const orderPayload = {
    user: userId,
    items: calculation.items,
    shippingAddress,
    paymentMethod,
    subtotal: calculation.subtotal,
    discountAmount: calculation.discountAmount,
    discount: calculation.discountAmount,
    couponDiscount: calculation.discountAmount,
    deliveryCharge: calculation.deliveryCharge,
    shipping: calculation.deliveryCharge,
    taxAmount: calculation.taxAmount,
    tax: calculation.taxAmount,
    grandTotal: calculation.grandTotal,
    appliedCoupon: calculation.appliedCoupon || "",
    orderStatus: "pending",
    paymentStatus: "pending",
  };

  // If COD, clear cart and reduce stock immediately
  if (paymentMethod === "cod") {
    // Atomically reduce stock first with failure safety (fails if insufficient stock)
    await reduceStock(calculation.items);

    orderPayload.orderStatus = "confirmed";
    orderPayload.paymentStatus = "pending"; // Will be marked paid on delivery

    let order;
    try {
      order = await Order.create(orderPayload);
    } catch (orderErr) {
      // Rollback stock if order creation failed
      for (const item of calculation.items) {
        if (item.cake) {
          await restoreStock(item.cake, item.flavor, item.size, item.quantity);
        }
      }
      throw orderErr;
    }

    // If coupon was applied, record usage
    if (order.appliedCoupon) {
      await Coupon.findOneAndUpdate(
        { code: order.appliedCoupon },
        { $inc: { usedCount: 1 } }
      );
    }

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

  // If Online payment (card/upi/stripe), create order but don't clear cart or reduce stock yet
  // Payment service will handle the rest upon verified payment
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
  restoreStock,
};
