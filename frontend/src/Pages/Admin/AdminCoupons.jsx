import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/features/admin/adminSlice";
import CouponModal from "@/components/admin/CouponModal";
import ConfirmModal from "@/components/admin/ConfirmModal";
import StatusBadge from "@/components/admin/StatusBadge";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Ticket, RefreshCw } from "lucide-react";

export default function AdminCoupons() {
  const dispatch = useDispatch();
  const { coupons, loading } = useSelector(s => s.admin);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminCoupons({ search, status: statusFilter !== "all" ? statusFilter : undefined }));
  }, [dispatch, search, statusFilter]);

  const handleCreate = async (data) => {
    const res = await dispatch(createCoupon(data));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Coupon created!");
      setModalOpen(false);
    } else {
      toast.error(res.payload || "Failed to create coupon");
    }
  };

  const handleUpdate = async (data) => {
    const res = await dispatch(updateCoupon({ id: editing._id, data }));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Coupon updated!");
      setEditing(null);
    } else {
      toast.error(res.payload || "Failed to update coupon");
    }
  };

  const handleDelete = async () => {
    const res = await dispatch(deleteCoupon(deleteTarget._id));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Coupon deleted");
      setDeleteTarget(null);
    } else {
      toast.error(res.payload || "Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Coupons Engine</h2>
          <p className="text-sm text-slate-500">{coupons.length} coupons</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-semibold text-sm transition-colors">
          <Plus size={16} /> New Coupon
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button onClick={() => dispatch(fetchAdminCoupons({}))} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Coupon Code", "Discount", "Min Order", "Limit", "Used", "Status", "Expires", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-slate-500 px-5 py-3.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="py-12 text-center text-slate-400"><RefreshCw className="animate-spin mx-auto" size={20} /></td></tr>}
              {!loading && coupons.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-slate-400">No coupons found</td></tr>}
              {coupons.map(coupon => (
                <tr key={coupon._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                        <Ticket size={16} />
                      </div>
                      <span className="font-mono font-bold text-slate-800 text-base">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                  </td>
                  <td className="px-5 py-4 text-slate-600">₹{coupon.minOrderAmount || 0}</td>
                  <td className="px-5 py-4 text-slate-500">{coupon.usageLimit ?? "Unlimited"}</td>
                  <td className="px-5 py-4 font-bold text-slate-700">{coupon.usedCount || 0}</td>
                  <td className="px-5 py-4"><StatusBadge status={coupon.isActive} /></td>
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                    {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString("en-IN") : "Never"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(coupon)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(coupon)} className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CouponModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} loading={loading} />
      <CouponModal open={!!editing} onClose={() => setEditing(null)} onSubmit={handleUpdate} initial={editing} loading={loading} />
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Coupon?"
        message={`"${deleteTarget?.code}" coupon will be marked as inactive.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
