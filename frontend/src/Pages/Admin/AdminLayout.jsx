import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

const PAGE_TITLES = {
  "/admin/dashboard":     "Dashboard",
  "/admin/products":      "Products",
  "/admin/orders":        "Orders",
  "/admin/users":         "Users",
  "/admin/categories":    "Categories",
  "/admin/occasions":     "Occasions",
  "/admin/cake-types":    "Cake Types",
  "/admin/reviews":       "Reviews",
  "/admin/coupons":       "Coupons",
  "/admin/banners":       "Banners",
  "/admin/notifications": "Notifications",
  "/admin/faqs":          "FAQs",
  "/admin/testimonials":   "Testimonials",
  "/admin/site-settings":  "Site Settings",
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || "Admin Panel";

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:ml-64 min-w-0 overflow-hidden">
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
