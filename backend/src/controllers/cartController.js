const cartService = require("../services/cartService");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    Get user's cart
 * @route   GET /api/v1/cart
 * @access  Protected
 */
const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getOrCreateCart(req.user._id);
  res.status(200).json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

/**
 * @desc    Add item to cart
 * @route   POST /api/v1/cart/add
 * @access  Protected
 */
const addToCart = asyncHandler(async (req, res) => {
  const cart = await cartService.addItemToCart(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, cart, "Item added to cart"));
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/v1/cart/:itemId
 * @access  Protected
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateCartItem(req.user._id, req.params.itemId, req.body.quantity);
  res.status(200).json(new ApiResponse(200, cart, "Cart item updated"));
});

/**
 * @desc    Remove single item from cart
 * @route   DELETE /api/v1/cart/:itemId
 * @access  Protected
 */
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await cartService.removeCartItem(req.user._id, req.params.itemId);
  res.status(200).json(new ApiResponse(200, cart, "Item removed from cart"));
});

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/v1/cart
 * @access  Protected
 */
const clearCart = asyncHandler(async (req, res) => {
  await cartService.clearCart(req.user._id);
  res.status(200).json(new ApiResponse(200, null, "Cart cleared successfully"));
});

/**
 * @desc    Apply coupon to cart
 * @route   POST /api/v1/cart/coupon
 * @access  Protected
 */
const applyCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const result = await cartService.applyCoupon(req.user._id, code, subtotal);
  res.status(200).json(new ApiResponse(200, result, `Coupon "${result.coupon.code}" applied — saved $${result.discountAmount.toFixed(2)}`));
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart, applyCoupon };