import { useSelector } from "react-redux";
import { Menu, Bell } from "lucide-react";

export default function AdminTopbar({ onMenuClick, title }) {
  const user = useSelector(state => state.auth.user);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">{title || "Admin Panel"}</h1>
      </div>

      {/* Right: user info */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-none">{user?.name || "Admin"}</p>
            <p className="text-xs text-pink-600 capitalize mt-0.5">{user?.role || "admin"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
