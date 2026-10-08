const Cart = require("../models/Cart");
const Cake = require("../models/Cake");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const ApiError = require("../utils/ApiError");

/**
 * Authoritative pricing resolution from Cake and Variant in DB.
 * Client discount and unitPrice are NEVER trusted.
 */
const resolveAuthoritativeItemPricing = (cake, flavor, size, isEggless, addons) => {
  // Find matching variant
  const variant = cake.variants?.find(
    (v) => (v.flavor === flavor && v.size === size)
  ) || cake.variants?.find(
    (v) => v.size === size
  ) || (cake.variants?.length > 0 ? cake.variants[0] : null);

  const basePrice = variant ? variant.price : (cake.basePrice || 0);

  let extrasCost = 0;
  if (isEggless) extrasCost += (cake.egglessPremium || 50);
  if (addons?.candles) extrasCost += 15;
  if (addons?.knife) extrasCost += 10;
  if (addons?.greetingCard) extrasCost += 30;

  const authoritativeUnitPrice = Math.round((basePrice + extrasCost) * 100) / 100;
  const authoritativeDiscount = typeof cake.discount === "number" ? Math.max(0, Math.min(100, cake.discount)) : 0;

  return {
    variant,
    unitPrice: authoritativeUnitPrice,
    discount: authoritativeDiscount,
  };
};

/**
 * Calculate authoritative cart subtotal strictly from DB product/variant pricing
 */
const calculateCartSubtotal = (cart) => {
  let subtotal = 0;
  for (const item of cart.items) {
    if (!item.cake || item.cake.status !== "active") continue;
    const pricing = resolveAuthoritativeItemPricing(
      item.cake,
      item.flavor,
      item.size,
      item.isEggless,
      item.addons
    );
    const discountedPrice = pricing.unitPrice * (1 - pricing.discount / 100);
    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    subtotal += discountedPrice * qty;
  }
  return Math.round(subtotal * 100) / 100;
};

const siteSettingsService = require("./siteSettings.service");

/**
 * Calculate authoritative cart totals (subtotal, discountAmount, deliveryCharge, taxAmount, grandTotal)
 */
const calculateCartTotals = (cart) => {
  const subtotal = calculateCartSubtotal(cart);
  const discountAmount = cart.couponDiscount || 0;
  
  const settings = siteSettingsService.getSiteSettingsSync();
  const freeShippingThreshold = settings.shipping?.freeShippingThreshold ?? 800.0;
  const deliveryFee = settings.shipping?.shippingFee ?? 99.0;
  const taxRate = settings.shipping?.taxRate ?? 0.05;

  let deliveryCharge = 0;
  if (cart.items && cart.items.length > 0) {
    deliveryCharge = subtotal >= freeShippingThreshold ? 0 : deliveryFee;
  }
  
  const taxAmount = Math.round((subtotal * taxRate) * 100) / 100;
  
  const grandTotal = Math.max(
    0,
    Math.round((subtotal - discountAmount + deliveryCharge + taxAmount) * 100) / 100
  );

  return {
    subtotal,
    discountAmount,
    deliveryCharge,
    taxAmount,
    grandTotal,
  };
};

/**
 * Enriches cart document with authoritative server totals for API responses
 */
const formatCartResponse = (cart) => {
  if (!cart) return null;
  const cartObj = cart.toObject ? cart.toObject() : { ...cart };
  const totals = calculateCartTotals(cart);
  return {
    ...cartObj,
    ...totals,
  };
};

/**
 * Validate coupon rules and calculate discount against server-authoritative subtotal
 */
const validateAndCalculateCoupon = async (userId, code, authoritativeSubtotal) => {
  if (!code || typeof code !== "string" || code.trim() === "") {
    return {
      coupon: { code: "" },
      discountAmount: 0,
      subtotal: authoritativeSubtotal,
    };
  }

  const cleanCode = code.trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
  if (!coupon) {
    throw new ApiError(404, "Invalid or expired coupon code");
  }

  // 1. Expiration check
  const now = new Date();
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
    throw new ApiError(400, "This coupon has expired");
  }

  // 2. Global usage limit check
  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, "This coupon has reached its total usage limit");
  }

  // 3. Minimum order amount check (against server-calculated subtotal, never client subtotal)
  if (coupon.minOrderAmount && authoritativeSubtotal < coupon.minOrderAmount) {
    throw new ApiError(
      400,
      `Minimum order amount of ₹${coupon.minOrderAmount} required for coupon "${coupon.code}" (Current subtotal: ₹${authoritativeSubtotal.toFixed(2)})`
    );
  }

  // 4. Per-user usage limit check
  if (coupon.perUserLimit && userId) {
    const userOrderCount = await Order.countDocuments({
      user: userId,
      appliedCoupon: coupon.code,
      orderStatus: { $ne: "cancelled" },
    });
    if (userOrderCount >= coupon.perUserLimit) {
      throw new ApiError(
        400,
        `You have already used coupon "${coupon.code}" the maximum allowed number of times (${coupon.perUserLimit})`
      );
    }
  }

  // 5. Calculate discount from server subtotal
  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (authoritativeSubtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else {
    // flat
    discountAmount = coupon.discountValue;
  }

  // 6. Cap discount so it can never exceed authoritative subtotal
  discountAmount = Math.min(discountAmount, authoritativeSubtotal);
  discountAmount = Math.max(0, Math.round(discountAmount * 100) / 100);

  return {
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      description: coupon.description,
    },
    discountAmount,
    subtotal: authoritativeSubtotal,
  };
};

/**
 * Get or create cart for a user.
 * Automatically sanitizes any stale or manipulated items against live DB pricing.
 */
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate(
    "items.cake",
    "name thumbnail gallery slug status variants discount basePrice egglessPremium"
  );
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    return cart;
  }

  // Sanitize existing items: heal any previously manipulated price/discount metadata
  let modified = false;
  for (const item of cart.items) {
    if (item.cake) {
      const pricing = resolveAuthoritativeItemPricing(
        item.cake,
        item.flavor,
        item.size,
        item.isEggless,
        item.addons
      );
      if (item.unitPrice !== pricing.unitPrice || item.discount !== pricing.discount) {
        item.unitPrice = pricing.unitPrice;
        item.discount = pricing.discount;
        modified = true;
      }
    }
  }

  // If cart has an applied coupon, revalidate and recompute discount based on authoritative subtotal
  if (cart.appliedCoupon) {
    const subtotal = calculateCartSubtotal(cart);
    try {
      const couponResult = await validateAndCalculateCoupon(userId, cart.appliedCoupon, subtotal);
      if (cart.couponDiscount !== couponResult.discountAmount) {
        cart.couponDiscount = couponResult.discountAmount;
        modified = true;
      }
    } catch {
      // Coupon no longer valid (e.g. subtotal fell below min, expired) -> reset
      cart.appliedCoupon = "";
      cart.couponDiscount = 0;
      modified = true;
    }
  }

  if (modified) {
    await cart.save();
  }

  return cart;
};

/**
 * Add item to cart — strictly resolves price and discount from DB Cake data.
 * Client discount and unitPrice are completely ignored.
 */
const addItemToCart = async (userId, itemData) => {
  const {
    cakeId, flavor, size, quantity = 1,
    isEggless = false, cakeMessage = "",
    photoUrl = "", deliveryDate, deliveryTimeSlot = "", addons = {}
  } = itemData;

  // 1. Validate the cake exists and is active
  const cake = await Cake.findById(cakeId);
  if (!cake) throw new ApiError(404, "Cake not found");
  if (cake.status !== "active") {
    throw new ApiError(400, "This product is currently inactive and cannot be ordered");
  }

  // 2. Authoritative server-side pricing resolution
  const pricing = resolveAuthoritativeItemPricing(cake, flavor, size, isEggless, addons);

  const safeQuantity = Math.max(1, parseInt(quantity, 10) || 1);

  // 3. Validate variant stock
  if (pricing.variant && pricing.variant.stock < safeQuantity) {
    throw new ApiError(400, `Only ${pricing.variant.stock} units available in stock`);
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  cart.items.push({
    cake: cakeId,
    flavor: pricing.variant ? pricing.variant.flavor : (flavor || ""),
    size: pricing.variant ? pricing.variant.size : (size || ""),
    quantity: safeQuantity,
    unitPrice: pricing.unitPrice,     // Authoritative server value
    discount: pricing.discount,       // Authoritative server value (client discount ignored)
    isEggless: Boolean(isEggless),
    cakeMessage: typeof cakeMessage === "string" ? cakeMessage.trim() : "",
    photoUrl: typeof photoUrl === "string" ? photoUrl : "",
    deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
    deliveryTimeSlot: typeof deliveryTimeSlot === "string" ? deliveryTimeSlot : "",
    addons: addons || {},
  });

  // 4. Revalidate coupon if currently applied to cart
  if (cart.appliedCoupon) {
    await cart.populate("items.cake", "name thumbnail gallery slug status variants discount basePrice egglessPremium");
    const subtotal = calculateCartSubtotal(cart);
    try {
      const couponResult = await validateAndCalculateCoupon(userId, cart.appliedCoupon, subtotal);
      cart.couponDiscount = couponResult.discountAmount;
    } catch {
      cart.appliedCoupon = "";
      cart.couponDiscount = 0;
    }
  }

  await cart.save();
  return Cart.findById(cart._id).populate("items.cake", "name thumbnail gallery slug variants discount basePrice");
};

/**
 * Update item quantity in cart
 */
const updateCartItem = async (userId, itemId, quantity) => {
  const safeQty = Math.max(1, parseInt(quantity, 10) || 1);

  const cart = await Cart.findOne({ user: userId }).populate(
    "items.cake",
    "name thumbnail gallery slug status variants discount basePrice egglessPremium"
  );
  if (!cart) throw new ApiError(404, "Cart not found");

  const item = cart.items.id(itemId);
  if (!item) throw new ApiError(404, "Item not found in cart");

  if (item.cake) {
    const pricing = resolveAuthoritativeItemPricing(
      item.cake,
      item.flavor,
      item.size,
      item.isEggless,
      item.addons
    );
    if (pricing.variant && pricing.variant.stock < safeQty) {
      throw new ApiError(400, `Only ${pricing.variant.stock} units available in stock`);
    }
    // Refresh authoritative pricing on update
    item.unitPrice = pricing.unitPrice;
    item.discount = pricing.discount;
  }

  item.quantity = safeQty;

  // Revalidate coupon on quantity change
  if (cart.appliedCoupon) {
    const subtotal = calculateCartSubtotal(cart);
    try {
      const couponResult = await validateAndCalculateCoupon(userId, cart.appliedCoupon, subtotal);
      cart.couponDiscount = couponResult.discountAmount;
    } catch {
      cart.appliedCoupon = "";
      cart.couponDiscount = 0;
    }
  }

  await cart.save();
  return Cart.findById(cart._id).populate("items.cake", "name thumbnail gallery slug");
};

/**
 * Remove item from cart
 */
const removeCartItem = async (userId, itemId) => {
  const cart = await Cart.findOne({ user: userId }).populate(
    "items.cake",
    "name thumbnail gallery slug status variants discount basePrice egglessPremium"
  );
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

  // Revalidate or clear coupon
  if (cart.items.length === 0) {
    cart.appliedCoupon = "";
    cart.couponDiscount = 0;
  } else if (cart.appliedCoupon) {
    const subtotal = calculateCartSubtotal(cart);
    try {
      const couponResult = await validateAndCalculateCoupon(userId, cart.appliedCoupon, subtotal);
      cart.couponDiscount = couponResult.discountAmount;
    } catch {
      cart.appliedCoupon = "";
      cart.couponDiscount = 0;
    }
  }

  await cart.save();
  return cart;
};

/**
 * Clear entire cart
 */
const clearCart = async (userId) => {
  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { items: [], appliedCoupon: "", couponDiscount: 0 },
    { new: true }
  );
  return cart;
};

/**
 * Apply coupon — 100% server-side calculation.
 * Client-provided subtotal is COMPLETELY IGNORED.
 */
const applyCoupon = async (userId, code) => {
  if (!code || typeof code !== "string" || code.trim() === "") {
    await Cart.findOneAndUpdate(
      { user: userId },
      { appliedCoupon: "", couponDiscount: 0 }
    );
    return { coupon: { code: "" }, discountAmount: 0, subtotal: 0 };
  }

  // 1. Load user's cart with populated cake details
  const cart = await Cart.findOne({ user: userId }).populate(
    "items.cake",
    "name thumbnail gallery slug status variants discount basePrice egglessPremium"
  );

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty. Add items before applying a coupon.");
  }

  // 2. Authoritatively calculate real cart subtotal from database product data
  const realSubtotal = calculateCartSubtotal(cart);

  if (realSubtotal <= 0) {
    throw new ApiError(400, "Cart total must be greater than zero to apply a coupon.");
  }

  // 3. Validate coupon and calculate discount against the real subtotal
  const result = await validateAndCalculateCoupon(userId, code, realSubtotal);

  // 4. Save validated coupon information to user's cart
  cart.appliedCoupon = result.coupon.code;
  cart.couponDiscount = result.discountAmount;

  const settings = siteSettingsService.getSiteSettingsSync();
  const freeShippingThreshold = settings.shipping?.freeShippingThreshold ?? 800.0;
  const deliveryFee = settings.shipping?.shippingFee ?? 99.0;
  const taxRate = settings.shipping?.taxRate ?? 0.05;

  let deliveryCharge = 0;
  if (cart.items && cart.items.length > 0) {
    deliveryCharge = realSubtotal >= freeShippingThreshold ? 0 : deliveryFee;
  }
  
  const taxAmount = Math.round((realSubtotal * taxRate) * 100) / 100;
  
  const grandTotal = Math.max(
    0,
    Math.round((realSubtotal - result.discountAmount + deliveryCharge + taxAmount) * 100) / 100
  );

  return {
    ...result,
    deliveryCharge,
    taxAmount,
    grandTotal,
  };
};

module.exports = {
  getOrCreateCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  resolveAuthoritativeItemPricing,
  calculateCartSubtotal,
  calculateCartTotals,
  formatCartResponse,
  validateAndCalculateCoupon,
  DELIVERY_CHARGE: 99.0,
};
