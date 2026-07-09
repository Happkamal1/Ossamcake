import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "@/features/admin/adminSlice";
import StatCard from "@/components/admin/StatCard";
import RevenueChart from "@/components/admin/RevenueChart";
import StatusBadge from "@/components/admin/StatusBadge";
import {
  DollarSign, ShoppingBag, Users, Package, Clock, CheckCircle2, Star, RefreshCw
} from "lucide-react";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { stats, revenue, topProducts, recentOrders, loading } = useSelector(s => s.admin);

  useEffect(() => { dispatch(fetchDashboardStats()); }, [dispatch]);

  const fmt = (n) => n?.toLocaleString("en-IN") ?? "—";
  const fmtCurrency = (n) => n != null ? `₹${n.toLocaleString("en-IN")}` : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Dashboard Overview</h2>
          <p className="text-sm text-slate-500 mt-0.5">Welcome back! Here's what's happening.</p>
        </div>
        <button
          onClick={() => dispatch(fetchDashboardStats())}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={fmtCurrency(stats?.totalRevenue)} icon={DollarSign} iconBg="bg-emerald-500" />
        <StatCard title="Total Orders" value={fmt(stats?.totalOrders)} icon={ShoppingBag} iconBg="bg-blue-500" />
        <StatCard title="Customers" value={fmt(stats?.totalUsers)} icon={Users} iconBg="bg-violet-500" />
        <StatCard title="Products" value={fmt(stats?.totalProducts)} icon={Package} iconBg="bg-pink-500" />
        <StatCard title="Pending Orders" value={fmt(stats?.pendingOrders)} icon={Clock} iconBg="bg-amber-500" />
        <StatCard title="Delivered" value={fmt(stats?.deliveredOrders)} icon={CheckCircle2} iconBg="bg-emerald-600" />
        <StatCard title="Reviews" value={fmt(stats?.totalReviews)} icon={Star} iconBg="bg-orange-500" />
      </div>

      {/* Revenue Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={revenue} />
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-base font-bold text-slate-800 mb-4">Top Products</h3>
          {topProducts?.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts?.slice(0, 5).map((p, i) => (
                <div key={p._id || i} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-pink-100 text-pink-600 font-black text-xs flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.totalSold} sold</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">₹{p.totalRevenue?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800">Recent Orders</h3>
          <a href="/admin/orders" className="text-sm text-pink-600 hover:text-pink-700 font-semibold">View All →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Order #", "Customer", "Amount", "Status", "Date"].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-slate-500 pb-3 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders?.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-slate-400">No orders yet</td></tr>
              )}
              {recentOrders?.map(order => (
                <tr key={order._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4 font-mono font-bold text-pink-600">{order.orderNumber}</td>
                  <td className="py-3 pr-4 text-slate-700">{order.user?.name || "—"}</td>
                  <td className="py-3 pr-4 font-bold text-slate-800">₹{order.grandTotal?.toLocaleString()}</td>
                  <td className="py-3 pr-4"><StatusBadge status={order.orderStatus} /></td>
                  <td className="py-3 text-slate-500 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
