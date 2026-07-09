import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrders, updateOrderStatus } from "@/features/admin/adminSlice";
import StatusBadge from "@/components/admin/StatusBadge";
import { toast } from "sonner";
import { Search, RefreshCw, ChevronDown } from "lucide-react";

const STATUS_OPTIONS = ["pending", "preparing", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector(s => s.admin);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminOrders({ search: search || undefined, status: statusFilter !== "all" ? statusFilter : undefined }));
  }, [dispatch, search, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
    if (res.meta.requestStatus === "fulfilled") toast.success("Order status updated");
    else toast.error(res.payload || "Failed to update status");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-800">Orders</h2>
          <p className="text-sm text-slate-500">{orders.length} orders</p>
        </div>
        <button onClick={() => dispatch(fetchAdminOrders({}))} className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order number..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${statusFilter === s ? "bg-pink-600 text-white" : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Order #", "Customer", "Items", "Total", "Payment", "Status", "Date", "Update Status"].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-slate-500 px-5 py-3.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="py-12 text-center text-slate-400"><RefreshCw className="animate-spin mx-auto mb-2" size={20} />Loading...</td></tr>}
              {!loading && orders.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-slate-400">No orders found</td></tr>}
              {orders.map(order => (
                <>
                  <tr key={order._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}>
                    <td className="px-5 py-4 font-mono font-bold text-pink-600">{order.orderNumber}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{order.user?.name || "Guest"}</p>
                      <p className="text-xs text-slate-400">{order.user?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{order.items?.length} item(s)</td>
                    <td className="px-5 py-4 font-bold text-slate-800">₹{order.grandTotal?.toLocaleString()}</td>
                    <td className="px-5 py-4"><StatusBadge status={order.paymentStatus} /></td>
                    <td className="px-5 py-4"><StatusBadge status={order.orderStatus} /></td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                      <div className="relative">
                        <select
                          value={order.orderStatus}
                          onChange={e => handleStatusChange(order._id, e.target.value)}
                          className="appearance-none border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 pr-8 cursor-pointer"
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </td>
                  </tr>
                  {expandedId === order._id && (
                    <tr key={`${order._id}-expand`} className="bg-slate-50">
                      <td colSpan={8} className="px-5 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-bold text-slate-600 mb-2">Order Items</p>
                            {order.items?.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm py-1.5 border-b border-slate-100">
                                <span className="text-slate-700">{item.name} × {item.quantity}</span>
                                <span className="font-semibold text-slate-800">₹{(item.unitPrice * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-600 mb-2">Shipping Address</p>
                            <p className="text-sm text-slate-700">{order.shippingAddress?.name}</p>
                            <p className="text-sm text-slate-500">{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
                            <p className="text-sm text-slate-500">{order.shippingAddress?.state} - {order.shippingAddress?.zip}</p>
                            <p className="text-sm text-slate-500 mt-1">📞 {order.shippingAddress?.phone}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
