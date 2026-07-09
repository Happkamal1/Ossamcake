const dashboardService = require("../../services/admin/dashboard.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const MESSAGES = require("../../constants/messages");

const getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats();
  res.status(200).json(new ApiResponse(200, stats, MESSAGES.DASHBOARD_FETCHED));
});

const getRecentOrders = asyncHandler(async (req, res) => {
  const orders = await dashboardService.getRecentOrders(Number(req.query.limit) || 10);
  res.status(200).json(new ApiResponse(200, orders, "Recent orders fetched"));
});

const getRevenueChart = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRevenueByMonth(req.query.year);
  res.status(200).json(new ApiResponse(200, data, "Revenue chart data fetched"));
});

const getTopProducts = asyncHandler(async (req, res) => {
  const products = await dashboardService.getTopProducts(Number(req.query.limit) || 5);
  res.status(200).json(new ApiResponse(200, products, "Top products fetched"));
});

module.exports = { getStats, getRecentOrders, getRevenueChart, getTopProducts };
