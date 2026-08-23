import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Bell, Plus, Search, Send, Trash2, Copy, Edit3, Filter,
  ChevronLeft, ChevronRight, Users, Clock, CheckCircle, Archive,
  AlertCircle, XCircle, Loader2, X, Eye
} from "lucide-react";
import {
  fetchAdminNotifications,
  createAdminNotification,
  updateAdminNotification,
  deleteAdminNotification,
  sendAdminNotification,
  duplicateAdminNotification,
} from "@/features/notifications/notificationSlice";

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  draft:     { label: "Draft",     color: "bg-gray-100 text-gray-600",    icon: Edit3 },
  scheduled: { label: "Scheduled", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  active:    { label: "Active",    color: "bg-green-100 text-green-700",  icon: CheckCircle },
  expired:   { label: "Expired",   color: "bg-slate-100 text-slate-500",  icon: Archive },
  disabled:  { label: "Disabled",  color: "bg-red-100 text-red-600",      icon: XCircle },
};

const TYPE_OPTIONS = [
  "promotion", "offer", "coupon", "order", "security", "account", "system", "announcement", "custom"
];

const TARGET_OPTIONS = [
  { value: "all",      label: "All Active Users" },
  { value: "role",     label: "By Role" },
  { value: "new",      label: "New Users (last 30 days)" },
  { value: "inactive", label: "Inactive Users (90+ days)" },
];

const EMPTY_FORM = {
  title: "", slug: "", shortDescription: "", message: "",
  image: "", relatedProduct: "", relatedOrder: "",
  type: "announcement", priority: "medium",
  targetType: "all", targetRole: "",
  buttonText: "", buttonLink: "",
  status: "draft", scheduledAt: "", expiresAt: "",
};

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${cfg.color}`}>
      <Icon size={9} /> {cfg.label}
    </span>
  );
}

// ── Notification Row ──────────────────────────────────────────────────────────
function NotificationRow({ notif, onEdit, onDelete, onSend, onDuplicate, sending }) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors group">
      <td className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center flex-shrink-0">
            <Bell size={14} className="text-rose-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate max-w-[260px]">{notif.title}</p>
            {notif.shortDescription && (
              <p className="text-xs text-slate-500 truncate max-w-[260px]">{notif.shortDescription}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-xs text-slate-600 capitalize">{notif.type}</span>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-xs text-slate-600 capitalize">{notif.targetType}</span>
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={notif.status} />
      </td>
      <td className="px-4 py-3.5 text-xs text-slate-500">
        {notif.sentAt ? new Date(notif.sentAt).toLocaleDateString() : "—"}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {notif.status !== "active" && notif.status !== "expired" && (
            <button
              onClick={() => onSend(notif._id)}
              disabled={sending}
              title="Send Now"
              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          )}
          <button onClick={() => onEdit(notif)} title="Edit" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit3 size={14} />
          </button>
          <button onClick={() => onDuplicate(notif._id)} title="Duplicate" className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <Copy size={14} />
          </button>
          <button onClick={() => onDelete(notif._id)} title="Delete" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Create/Edit Modal ─────────────────────────────────────────────────────────
function NotificationModal({ notif, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(notif || EMPTY_FORM);
  const [sendNow, setSendNow] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    onSubmit({ ...form, sendImmediately: sendNow });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-base font-bold text-slate-900">{notif ? "Edit Notification" : "Create Notification"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Title *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. 🎉 Weekend Sale — 30% OFF!"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent" />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Slug <span className="text-slate-400 normal-case font-normal">(auto-generated if empty)</span>
            </label>
            <input value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
              placeholder="e.g. weekend-sale-30-off"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent" />
            <p className="text-[11px] text-slate-400 mt-1">Used in URL: /notifications/<span className="text-indigo-500">{form.slug || "auto-generated"}</span></p>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Short Description</label>
            <input value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)}
              placeholder="Shown in the notification list preview..."
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent" />
          </div>

          {/* Banner Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Banner Image URL (optional)</label>
            <input value={form.image} onChange={(e) => set("image", e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent" />
          </div>

          {/* Full Message */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Full Message (Details)</label>
            <textarea value={form.message} onChange={(e) => set("message", e.target.value)}
              placeholder="The full detailed message shown when the notification is opened..."
              rows={4}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent resize-y" />
          </div>

          {/* Type + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white">
                {TYPE_OPTIONS.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Priority</label>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white">
                {["low", "medium", "high", "urgent"].map((p) => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Target */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Target Audience</label>
              <select value={form.targetType} onChange={(e) => set("targetType", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white">
                {TARGET_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            {form.targetType === "role" && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Role</label>
                <select value={form.targetRole} onChange={(e) => set("targetRole", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white">
                  <option value="">Select role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
          </div>

          {/* Button Text + Link */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">CTA Button Text</label>
              <input value={form.buttonText} onChange={(e) => set("buttonText", e.target.value)}
                placeholder="e.g. Shop Now"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">CTA Link URL</label>
              <input value={form.buttonLink} onChange={(e) => set("buttonLink", e.target.value)}
                placeholder="e.g. /shop?sale=true"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent" />
            </div>
          </div>

          {/* Related Product & Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Related Product ID (optional)</label>
              <input value={form.relatedProduct} onChange={(e) => set("relatedProduct", e.target.value)}
                placeholder="e.g. 64c92...2312"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Related Order ID (optional)</label>
              <input value={form.relatedOrder} onChange={(e) => set("relatedOrder", e.target.value)}
                placeholder="e.g. 64c92...5555"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent" />
            </div>
          </div>

          {/* Schedule + Expires */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Schedule At (optional)</label>
              <input type="datetime-local" value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Expires At (optional)</label>
              <input type="datetime-local" value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent" />
            </div>
          </div>

          {/* Send immediately toggle (only for new) */}
          {!notif && (
            <label className="flex items-center gap-3 cursor-pointer bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <input type="checkbox" checked={sendNow} onChange={(e) => setSendNow(e.target.checked)}
                className="w-4 h-4 accent-green-600 rounded" />
              <div>
                <p className="text-sm font-semibold text-green-800">Send Immediately</p>
                <p className="text-xs text-green-600">Notify all matching users right now (bypasses scheduling)</p>
              </div>
            </label>
          )}

          {/* Status (only for edit) */}
          {notif && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white">
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <button onClick={onClose} type="button"
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-sm font-bold rounded-xl hover:shadow-lg disabled:opacity-60 transition-all flex items-center gap-2">
            {submitting ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : notif ? "Save Changes" : sendNow ? "Create & Send" : "Save as Draft"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminNotifications() {
  const dispatch = useDispatch();
  const { adminNotifications, adminPagination, adminLoading, adminSubmitting } = useSelector(
    (s) => s.notifications
  );

  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("");
  const [typeFilter, setType]     = useState("");
  const [page, setPage]           = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [sendingId, setSendingId] = useState(null);

  const load = () => {
    dispatch(fetchAdminNotifications({ page, limit: 15, search, status: statusFilter, type: typeFilter }));
  };

  useEffect(() => { load(); }, [page, search, statusFilter, typeFilter]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit   = (notif) => { setEditing(notif); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await dispatch(updateAdminNotification({ id: editing._id, data })).unwrap();
        toast.success("Notification updated");
      } else {
        const res = await dispatch(createAdminNotification(data)).unwrap();
        const count = res?.recipientCount;
        toast.success(count != null ? `Sent to ${count} users!` : "Notification created as draft");
      }
      closeModal();
      load();
    } catch (err) {
      toast.error(err || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification and all user records?")) return;
    try {
      await dispatch(deleteAdminNotification(id)).unwrap();
      toast.success("Notification deleted");
    } catch (err) {
      toast.error(err || "Delete failed");
    }
  };

  const handleSend = async (id) => {
    setSendingId(id);
    try {
      const res = await dispatch(sendAdminNotification(id)).unwrap();
      toast.success(`Sent to ${res?.recipientCount ?? 0} users!`);
    } catch (err) {
      toast.error(err || "Send failed");
    } finally {
      setSendingId(null);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await dispatch(duplicateAdminNotification(id)).unwrap();
      toast.success("Notification duplicated as draft");
    } catch (err) {
      toast.error(err || "Duplicate failed");
    }
  };

  const totalPages = adminPagination?.totalPages || 1;

  return (
    <div className="space-y-5 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Bell size={22} className="text-pink-500" /> Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {adminPagination?.total ?? 0} total notifications
          </p>
        </div>
        <button
          onClick={openCreate}
          id="create-notification-btn"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-pink-200 hover:shadow-pink-300 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={16} /> Create Notification
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white">
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white">
          <option value="">All Types</option>
          {TYPE_OPTIONS.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Notification</th>
                <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Target</th>
                <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Sent</th>
                <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : adminNotifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                        <Bell size={24} className="text-slate-400" />
                      </div>
                      <p className="font-semibold text-slate-600">No notifications found</p>
                      <button onClick={openCreate}
                        className="text-sm text-pink-600 font-semibold hover:underline flex items-center gap-1">
                        <Plus size={14} /> Create your first notification
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                adminNotifications.map((notif) => (
                  <NotificationRow
                    key={notif._id}
                    notif={notif}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onSend={handleSend}
                    onDuplicate={handleDuplicate}
                    sending={sendingId === notif._id && adminSubmitting}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages} · {adminPagination?.total} total
            </p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <NotificationModal
          notif={editing}
          onClose={closeModal}
          onSubmit={handleSubmit}
          submitting={adminSubmitting}
        />
      )}
    </div>
  );
}
