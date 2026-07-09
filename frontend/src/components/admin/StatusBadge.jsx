const STATUS_MAP = {
  // Order statuses
  pending:   { label: "Pending",   cls: "bg-amber-100  text-amber-700  border-amber-200"  },
  preparing: { label: "Preparing", cls: "bg-blue-100   text-blue-700   border-blue-200"   },
  shipped:   { label: "Shipped",   cls: "bg-purple-100 text-purple-700 border-purple-200" },
  delivered: { label: "Delivered", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", cls: "bg-red-100    text-red-700    border-red-200"    },
  // Payment statuses
  paid:      { label: "Paid",      cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  failed:    { label: "Failed",    cls: "bg-red-100    text-red-700    border-red-200"    },
  refunded:  { label: "Refunded",  cls: "bg-slate-100  text-slate-600  border-slate-200"  },
  // User statuses
  active:    { label: "Active",    cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  inactive:  { label: "Inactive",  cls: "bg-slate-100  text-slate-600  border-slate-200"  },
  suspended: { label: "Suspended", cls: "bg-red-100    text-red-700    border-red-200"    },
  // Generic
  true:      { label: "Active",    cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  false:     { label: "Inactive",  cls: "bg-slate-100  text-slate-600  border-slate-200"  },
};

export default function StatusBadge({ status }) {
  const key = String(status).toLowerCase();
  const { label, cls } = STATUS_MAP[key] || { label: status, cls: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  );
}
