import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BellOff, CheckCheck, RefreshCw, Sparkles, BellRing } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchNotifications,
  markAllAsRead,
  clearUserNotifications,
} from "@/features/notifications/notificationSlice";
import NotificationItem from "@/components/notifications/NotificationItem";

const TABS = [
  { id: "all", label: "All Notifications", filter: null },
  { id: "unread", label: "Unread", filter: "unread" },
];

export default function MyNotifications() {
  const dispatch = useDispatch();
  const { notifications, loading, hasMore, page, unreadCount } = useSelector(
    (s) => s.notifications
  );
  const [activeTab, setActiveTab] = useState(TABS[0]);

  useEffect(() => {
    dispatch(clearUserNotifications());
    dispatch(fetchNotifications({ page: 1, reset: true }));
  }, [dispatch]);

  const filtered =
    activeTab.filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const handleMarkAll = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      toast.success("All caught up!");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      dispatch(fetchNotifications({ page: page + 1, reset: false }));
    }
  };

  return (
    <div className="max-w-3xl pb-12">
      {/* Premium Header */}
      <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-[1px]">
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 overflow-hidden z-10">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20 text-white transform -rotate-3 hover:rotate-0 transition-transform">
                <BellRing size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  My Alerts <Sparkles size={18} className="text-pink-500" />
                </h2>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  You have <strong className="text-pink-600">{unreadCount} unread</strong> messages
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all"
              >
                <CheckCheck size={16} className="text-green-400 group-hover:scale-110 transition-transform" />
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sleek Animated Tabs */}
      <div className="flex gap-2 mb-6 p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl w-fit border border-slate-200/50">
        {TABS.map((tab) => {
          const isActive = activeTab.id === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/50"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab.label}
                {tab.id === "unread" && unreadCount > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black transition-colors ${isActive ? "bg-pink-100 text-pink-600" : "bg-slate-200 text-slate-500"}`}>
                    {unreadCount}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notification List Container */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden relative min-h-[400px] flex flex-col">
        
        {/* Skeleton Loaders */}
        {loading && notifications.length === 0 && (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse bg-white p-4 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-slate-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-6 shadow-inner"
            >
              <BellOff size={40} className="text-slate-400" />
            </motion.div>
            <h3 className="text-xl font-black text-slate-800">
              {activeTab.filter === "unread" ? "No new alerts" : "All clear!"}
            </h3>
            <p className="text-slate-500 mt-2 max-w-sm">
              {activeTab.filter === "unread"
                ? "You've read all your notifications. Take a break!"
                : "We'll let you know when something important happens with your orders or account."}
            </p>
          </motion.div>
        )}

        {/* Items */}
        {filtered.length > 0 && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 max-h-[600px]">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                >
                  <NotificationItem item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Load More Bar */}
        {notifications.length > 0 && activeTab.filter !== "unread" && (
          <div className="p-4 border-t border-slate-100 bg-white/80 backdrop-blur-md sticky bottom-0 z-10 flex justify-center">
            {hasMore ? (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-700 transition-all disabled:opacity-50 hover:shadow-sm"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                {loading ? "Loading more..." : "Load older alerts"}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span className="w-12 h-px bg-slate-200" />
                End of History
                <span className="w-12 h-px bg-slate-200" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
