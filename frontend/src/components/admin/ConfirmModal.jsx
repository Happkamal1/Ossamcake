import { useState, useEffect } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Delete",
  danger = true,
  confirmKeyword = null,
  loading = false,
}) {
  const [typedConfirmation, setTypedConfirmation] = useState("");

  useEffect(() => {
    if (open) {
      setTypedConfirmation("");
    }
  }, [open]);

  if (!open) return null;

  const isConfirmed = confirmKeyword ? typedConfirmation.trim() === confirmKeyword : true;

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (isConfirmed && !loading) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${danger ? "bg-red-100" : "bg-amber-100"}`}>
            <AlertTriangle size={22} className={danger ? "text-red-600" : "text-amber-600"} />
          </div>
          <button
            onClick={loading ? undefined : onCancel}
            disabled={loading}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-2">{title || "Are you sure?"}</h3>
        <p className="text-sm text-slate-500 mb-4 leading-relaxed">{message || "This action cannot be undone."}</p>

        {confirmKeyword && (
          <form onSubmit={handleSubmit} className="mb-6 space-y-2">
            <label className="text-xs font-semibold text-slate-600 block">
              Type <span className="font-mono font-bold text-red-600 select-all">{confirmKeyword}</span> to confirm:
            </label>
            <input
              type="text"
              value={typedConfirmation}
              onChange={(e) => setTypedConfirmation(e.target.value)}
              placeholder={`Type ${confirmKeyword}`}
              disabled={loading}
              autoFocus
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-slate-100"
            />
          </form>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isConfirmed || loading}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
