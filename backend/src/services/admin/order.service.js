const Order = require("../../models/Order");
const ApiError = require("../../utils/ApiError");
const { parsePagination, parseSort, parseSearch, buildPaginationMeta } = require("../../utils/queryBuilder");
const { ORDER_STATUS } = require("../../constants/orderStatus");

const getAllOrders = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);
  const sort = parseSort(query.sort, "createdAt:-1");
  const filter = {};

  if (query.status && query.status !== "all") filter.orderStatus = query.status;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.userId) filter.user = query.userId;

  // Date range filter
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  // Search by orderNumber
  if (query.search) {
    filter.orderNumber = { $regex: query.search, $options: "i" };
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email mobileNumber")
      .populate("paymentTransaction")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return { orders, pagination: buildPaginationMeta(total, page, limit) };
};

const getOrderById = async (id) => {
  const order = await Order.findById(id)
    .populate("user", "name email mobileNumber")
    .populate("paymentTransaction")
    .lean();
  if (!order) throw new ApiError(404, "Order not found");
  return order;
};

const updateOrderStatus = async (id, status) => {
  const validStatuses = Object.values(ORDER_STATUS);
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid order status. Must be one of: ${validStatuses.join(", ")}`);
  }
  const order = await Order.findByIdAndUpdate(id, { orderStatus: status }, { new: true });
  if (!order) throw new ApiError(404, "Order not found");
  return order;
};

// Admin: get order revenue summary for a date range
const getOrderStats = async (startDate, endDate) => {
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  match.orderStatus = { $ne: ORDER_STATUS.CANCELLED };

  const stats = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$grandTotal" },
        totalOrders: { $sum: 1 },
        avgOrderValue: { $avg: "$grandTotal" },
      },
    },
  ]);

  return stats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
};

module.exports = { getAllOrders, getOrderById, updateOrderStatus, getOrderStats };
