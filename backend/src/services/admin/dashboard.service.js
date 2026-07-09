const Order = require("../../models/Order");
const User = require("../../models/User");
const Cake = require("../../models/Cake");
const Review = require("../../models/Review");
const { ORDER_STATUS } = require("../../constants/orderStatus");

/**
 * Admin Dashboard Service
 * Aggregates KPIs, recent orders, top products, and revenue charts.
 */

const getDashboardStats = async () => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    revenueResult,
    pendingOrders,
    deliveredOrders,
    totalReviews,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Cake.countDocuments({ status: "active" }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { orderStatus: { $ne: ORDER_STATUS.CANCELLED } } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]),
    Order.countDocuments({ orderStatus: ORDER_STATUS.PENDING }),
    Order.countDocuments({ orderStatus: ORDER_STATUS.DELIVERED }),
    Review.countDocuments(),
  ]);

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: revenueResult[0]?.total || 0,
    pendingOrders,
    deliveredOrders,
    totalReviews,
  };
};

const getRecentOrders = async (limit = 10) => {
  return await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

const getRevenueByMonth = async (year = new Date().getFullYear()) => {
  return await Order.aggregate([
    {
      $match: {
        orderStatus: { $ne: ORDER_STATUS.CANCELLED },
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        revenue: { $sum: "$grandTotal" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);
};

const getTopProducts = async (limit = 5) => {
  return await Order.aggregate([
    { $unwind: "$items" },
    { $match: { orderStatus: { $ne: ORDER_STATUS.CANCELLED } } },
    {
      $group: {
        _id: "$items.cake",
        name: { $first: "$items.name" },
        totalSold: { $sum: "$items.quantity" },
        totalRevenue: { $sum: { $multiply: ["$items.unitPrice", "$items.quantity"] } },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit },
  ]);
};

module.exports = { getDashboardStats, getRecentOrders, getRevenueByMonth, getTopProducts };
