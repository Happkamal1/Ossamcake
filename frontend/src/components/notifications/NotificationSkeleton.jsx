export default function NotificationSkeleton({ count = 6 }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex gap-4 p-5 bg-white rounded-2xl border border-slate-100 animate-pulse"
        >
          {/* Icon placeholder */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-slate-100" />
          </div>
          {/* Content placeholder */}
          <div className="flex-1 space-y-2.5 py-1">
            <div className="flex items-center gap-3">
              <div className="h-4 bg-slate-100 rounded-full w-16" />
              <div className="h-3 bg-slate-100 rounded-full w-12 ml-auto" />
            </div>
            <div className="h-4 bg-slate-100 rounded-full w-3/4" />
            <div className="h-3 bg-slate-100 rounded-full w-full" />
            <div className="h-3 bg-slate-100 rounded-full w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
