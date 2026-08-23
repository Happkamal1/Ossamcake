import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, CheckCheck, RefreshCw, Filter, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllAsRead,
  clearUserNotifications,
} from "@/features/notifications/notificationSlice";
import NotificationCard from "@/components/notifications/NotificationCard";
import NotificationSkeleton from "@/components/notifications/NotificationSkeleton";

// ── Filter tabs ───────────────────────────────────────────────────────────────
const FILTER_TABS = [
  { id: "all",    label: "All" },
  { id: "unread", label: "Unread" },
];

const TYPE_FILTERS = [
  { value: "", label: "All Types" },
  { value: "promotion",    label: "🎁 Promotions" },
  { value: "offer",        label: "⚡ Offers" },
  { value: "coupon",       label: "🎟️ Coupons" },
  { value: "order",        label: "📦 Orders" },
  { value: "security",     label: "🛡️ Security" },
  { value: "account",      label: "⭐ Account" },
  { value: "system",       label: "⚙️ System" },
  { value: "announcement", label: "📢 Announcements" },
];

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyState({ isFiltered }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center shadow-inner">
          <BellOff size={36} className="text-indigo-300" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full border-2 border-slate-100 flex items-center justify-center text-lg shadow-sm">
          {isFiltered ? "🔍" : "✨"}
        </div>
      </div>
      <h3 className="text-lg font-black text-slate-800 mb-2">
        {isFiltered ? "No matching notifications" : "You're all caught up!"}
      </h3>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
        {isFiltered
          ? "Try changing your filter to see more notifications."
          : "We'll notify you here when there's something new from OssamCake."}
      </p>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const dispatch = useDispatch();
  const { notifications, loading, hasMore, page, unreadCount } = useSelector(
    (s) => s.notifications
  );

  const [activeTab,  setActiveTab]  = useState("all");
  const [typeFilter, setTypeFilter] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  // Initial load
  useEffect(() => {
    dispatch(clearUserNotifications());
    dispatch(fetchNotifications({ page: 1, reset: true }));
    dispatch(fetchUnreadCount());
    return () => { dispatch(clearUserNotifications()); };
  }, [dispatch]);

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      dispatch(fetchNotifications({ page: page + 1, reset: false }));
    }
  }, [loading, hasMore, page, dispatch]);

  // Client-side filtering (all data is already fetched)
  const filtered = notifications.filter((item) => {
    if (!item.notification) return false;
    if (activeTab === "unread" && item.isRead) return false;
    if (typeFilter && item.notification.type !== typeFilter) return false;
    return true;
  });

  const isFiltered = activeTab !== "all" || typeFilter !== "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-start justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Bell size={20} className="text-white" />
                </div>
                <h1 className="text-2xl font-black text-slate-900">Notifications</h1>
              </div>
              <p className="text-sm text-slate-500 ml-[52px]">
                {unreadCount > 0
                  ? <><span className="font-bold text-indigo-600">{unreadCount}</span> unread notification{unreadCount !== 1 ? "s" : ""}</>
                  : "You're all caught up"}
              </p>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-2 rounded-xl transition-all"
                >
                  <CheckCheck size={14} />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setShowFilter((v) => !v)}
                className={`p-2.5 rounded-xl border transition-all ${showFilter ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                aria-label="Toggle filters"
              >
                <SlidersHorizontal size={16} />
              </button>
            </div>
          </motion.div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-5 overflow-hidden"
              >
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Filter size={12} /> Filter by type
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TYPE_FILTERS.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTypeFilter(t.value)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                          typeFilter === t.value
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Read / Unread tab bar */}
        <div className="flex items-center gap-1 mb-5 bg-slate-100 p-1 rounded-2xl w-fit">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              {tab.id === "unread" && unreadCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-black bg-indigo-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Skeleton loading */}
        {loading && notifications.length === 0 && <NotificationSkeleton count={6} />}

        {/* Notification cards */}
        {!loading && filtered.length === 0 && (
          <EmptyState isFiltered={isFiltered} />
        )}

        <div className="space-y-3">
          {filtered.map((item, idx) => (
            <NotificationCard key={item._id} item={item} index={idx} />
          ))}
        </div>

        {/* Load more */}
        {filtered.length > 0 && (
          <div className="mt-6 text-center">
            {hasMore ? (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm font-bold text-slate-600 hover:text-indigo-600 rounded-2xl transition-all disabled:opacity-50 shadow-sm"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                {loading ? "Loading…" : "Load more"}
              </button>
            ) : (
              notifications.length > 0 && (
                <p className="text-xs text-slate-400 font-medium">
                  🎉 You've seen all your notifications
                </p>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
