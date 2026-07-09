const orderService = require("../../services/admin/order.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const MESSAGES = require("../../constants/messages");

const getAllOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getAllOrders(req.query);
  res.status(200).json(new ApiResponse(200, result, MESSAGES.ORDERS_FETCHED));
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  res.status(200).json(new ApiResponse(200, order, MESSAGES.ORDER_FETCHED));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
  res.status(200).json(new ApiResponse(200, order, MESSAGES.ORDER_STATUS_UPDATED));
});

const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await orderService.getOrderStats(req.query.startDate, req.query.endDate);
  res.status(200).json(new ApiResponse(200, stats, "Order stats fetched successfully"));
});

module.exports = { getAllOrders, getOrderById, updateOrderStatus, getOrderStats };
