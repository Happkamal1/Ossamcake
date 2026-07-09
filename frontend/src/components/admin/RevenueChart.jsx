import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-900 text-white rounded-xl px-4 py-3 shadow-xl text-sm">
        <p className="font-bold mb-1">{MONTH_NAMES[label - 1] || label}</p>
        <p className="text-pink-400">₹{payload[0].value?.toLocaleString()}</p>
        <p className="text-slate-400 text-xs">{payload[1]?.value} orders</p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data = [] }) {
  // Normalize data: backend returns { _id: { month: N }, revenue: N, orders: N }
  const chartData = data.map(d => ({
    month: d._id?.month || d.month,
    revenue: d.revenue || 0,
    orders: d.orders || 0,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">Monthly Revenue</h3>
          <p className="text-sm text-slate-500 mt-0.5">Revenue breakdown by month</p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          No revenue data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tickFormatter={v => MONTH_NAMES[v - 1]?.substring(0, 3) || v}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
            <Bar dataKey="revenue" fill="#ec4899" radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
