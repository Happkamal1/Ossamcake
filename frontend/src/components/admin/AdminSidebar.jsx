import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/features/auth/authSlice";
import { toast } from "sonner";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, Calendar,
  Cake, Star, Ticket, Image, LogOut, ChevronRight, X, Bell,
  HelpCircle, Quote, Settings
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/products",  icon: Package,         label: "Products" },
  { to: "/admin/orders",    icon: ShoppingCart,    label: "Orders" },
  { to: "/admin/users",     icon: Users,           label: "Users" },
  { to: "/admin/categories",icon: Tag,             label: "Categories" },
  { to: "/admin/occasions", icon: Calendar,        label: "Occasions" },
  { to: "/admin/cake-types",icon: Cake,            label: "Cake Types" },
  { to: "/admin/reviews",        icon: Star,       label: "Reviews" },
  { to: "/admin/coupons",        icon: Ticket,     label: "Coupons" },
  { to: "/admin/banners",        icon: Image,      label: "Banners" },
  { to: "/admin/notifications",  icon: Bell,       label: "Notifications" },
  { to: "/admin/faqs",           icon: HelpCircle, label: "FAQs" },
  { to: "/admin/testimonials",   icon: Quote,      label: "Testimonials" },
  { to: "/admin/site-settings",  icon: Settings,   label: "Site Settings" },
];

export default function AdminSidebar({ open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-slate-900 z-40 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-black text-lg">
              O
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Ossam Cake</p>
              <p className="text-pink-400 text-xs mt-0.5">Admin Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => onClose && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? "bg-pink-600 text-white shadow-lg shadow-pink-900/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-red-600/20 hover:text-red-400 transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
