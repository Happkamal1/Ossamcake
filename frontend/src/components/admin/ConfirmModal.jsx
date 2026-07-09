import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = "Delete", danger = true }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${danger ? "bg-red-100" : "bg-amber-100"}`}>
            <AlertTriangle size={22} className={danger ? "text-red-600" : "text-amber-600"} />
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title || "Are you sure?"}</h3>
        <p className="text-sm text-slate-500 mb-6">{message || "This action cannot be undone."}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors ${danger ? "bg-red-600 hover:bg-red-700" : "bg-amber-500 hover:bg-amber-600"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
