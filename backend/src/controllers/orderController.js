const orderService = require("../services/orderService");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    Place order from cart
 * @route   POST /api/v1/orders
 * @access  Protected
 */
const placeOrder = asyncHandler(async (req, res) => {
  const order = await orderService.placeOrder(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, order, `Order placed successfully! Your order ID is ${order.orderNumber}`));
});

/**
 * @desc    Get user order history (Profile.jsx)
 * @route   GET /api/v1/orders
 * @access  Protected
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user._id);
  res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

/**
 * @desc    Get single order by orderNumber — used in TrackOrder.jsx
 * @route   GET /api/v1/orders/:orderNumber
 * @access  Public
 */
const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderByNumber(req.params.orderNumber);
  res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});

/**
 * @desc    Admin: Update order status
 * @route   PATCH /api/v1/orders/:id/status
 * @access  Admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
  res.status(200).json(new ApiResponse(200, order, "Order status updated successfully"));
});

module.exports = { placeOrder, getMyOrders, getOrder, updateOrderStatus };
