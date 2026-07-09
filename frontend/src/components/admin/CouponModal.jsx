import { useState, useEffect } from "react";
import { X } from "lucide-react";

const EMPTY = { code: "", description: "", discountType: "percentage", discountValue: "", minOrderAmount: "", usageLimit: "", expiresAt: "", isActive: true };

export default function CouponModal({ open, onClose, onSubmit, initial, loading }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (initial) {
      setForm({
        ...EMPTY, ...initial,
        expiresAt: initial.expiresAt ? new Date(initial.expiresAt).toISOString().split("T")[0] : "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [initial, open]);

  if (!open) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      discountValue: parseFloat(form.discountValue),
      minOrderAmount: parseFloat(form.minOrderAmount) || 0,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
      expiresAt: form.expiresAt || null,
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">{initial ? "Edit Coupon" : "New Coupon"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Coupon Code *</label>
              <input
                required value={form.code} onChange={e => set("code", e.target.value.toUpperCase())}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="CAKE20"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Discount Type *</label>
              <select value={form.discountType} onChange={e => set("discountType", e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500">
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                Discount Value ({form.discountType === "percentage" ? "%" : "₹"}) *
              </label>
              <input
                required type="number" min="0" value={form.discountValue} onChange={e => set("discountValue", e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="20"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Min. Order (₹)</label>
              <input
                type="number" min="0" value={form.minOrderAmount} onChange={e => set("minOrderAmount", e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Usage Limit</label>
              <input
                type="number" min="1" value={form.usageLimit} onChange={e => set("usageLimit", e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Unlimited"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Expires At</label>
              <input
                type="date" value={form.expiresAt} onChange={e => set("expiresAt", e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} className="w-4 h-4 accent-pink-600" />
                <span className="text-sm font-semibold text-slate-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-sm transition-colors disabled:opacity-60">
              {loading ? "Saving..." : initial ? "Update Coupon" : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
