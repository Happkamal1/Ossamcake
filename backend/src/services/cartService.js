const Cart = require("../models/Cart");
const Cake = require("../models/Cake");
const Coupon = require("../models/Coupon");
const ApiError = require("../utils/ApiError");

/**
 * Get or create cart for a user
 */
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.cake", "name images slug status");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

/**
 * Add item to cart — built to match itemData from CakeDetails.jsx handleAddToCart()
 */
const addItemToCart = async (userId, itemData) => {
  const {
    cakeId, flavor, size, quantity = 1, unitPrice,
    discount = 0, isEggless = false, cakeMessage = "",
    photoUrl = "", deliveryDate, deliveryTimeSlot = "", addons = {}
  } = itemData;

  // Validate the cake exists
  const cake = await Cake.findById(cakeId);
  if (!cake) throw new ApiError(404, "Cake not found");

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  cart.items.push({
    cake: cakeId,
    flavor,
    size,
    quantity,
    unitPrice,
    discount,
    isEggless,
    cakeMessage,
    photoUrl,
    deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
    deliveryTimeSlot,
    addons,
  });

  await cart.save();
  return Cart.findById(cart._id).populate("items.cake", "name images slug");
};

/**
 * Update item quantity in cart
 */
const updateCartItem = async (userId, itemId, quantity) => {
  if (quantity < 1) throw new ApiError(400, "Quantity must be at least 1");

  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ApiError(404, "Cart not found");

  const item = cart.items.id(itemId);
  if (!item) throw new ApiError(404, "Item not found in cart");

  item.quantity = quantity;
  await cart.save();
  return Cart.findById(cart._id).populate("items.cake", "name images slug");
};

/**
 * Remove item from cart
 */
const removeCartItem = async (userId, itemId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
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
 * Apply coupon — used in Cart.jsx coupon input
 */
const applyCoupon = async (userId, code, subtotal) => {
  if (!code) {
    await Cart.findOneAndUpdate(
      { user: userId },
      { appliedCoupon: "", couponDiscount: 0 }
    );
    return { coupon: { code: "" }, discountAmount: 0 };
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new ApiError(404, "Invalid or expired coupon code");

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    throw new ApiError(400, "This coupon has expired");
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new ApiError(400, "This coupon has reached its usage limit");
  }
  if (subtotal < coupon.minOrderAmount) {
    throw new ApiError(400, `Minimum order amount of $${coupon.minOrderAmount} required for this coupon`);
  }

  let discountAmount = 0;
  if (coupon.discountType === "percent") {
    discountAmount = (subtotal * coupon.discountValue) / 100;
  } else {
    discountAmount = coupon.discountValue;
  }

  await Cart.findOneAndUpdate(
    { user: userId },
    { appliedCoupon: coupon.code, couponDiscount: discountAmount }
  );

  return { coupon, discountAmount };
};

module.exports = { getOrCreateCart, addItemToCart, updateCartItem, removeCartItem, clearCart, applyCoupon };
