import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ title, value, subtitle, icon: Icon, iconBg, trend, trendValue }) {
  const isPositive = trend === "up";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-3xl font-black text-slate-800 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trendValue !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
              {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg || "bg-slate-100"}`}>
            <Icon size={22} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
