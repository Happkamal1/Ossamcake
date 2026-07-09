import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, BellOff, CheckCheck, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import {
  fetchNotifications,
  markAllAsRead,
  clearUserNotifications,
} from "@/features/notifications/notificationSlice";
import NotificationItem from "./NotificationItem";
import { toast } from "sonner";

export default function NotificationDrawer({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { notifications, loading, hasMore, page, unreadCount } = useSelector(
    (s) => s.notifications
  );
  const bottomRef = useRef(null);

  // Load notifications and lock body scroll when drawer opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearUserNotifications());
      dispatch(fetchNotifications({ page: 1, reset: true }));
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, dispatch]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      toast.success("All notifications marked as read");
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
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        className={`
          fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl
          flex flex-col transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full pointer-events-none invisible"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-base font-bold text-slate-900">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-xs text-slate-500">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                title="Mark all as read"
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 px-2.5 py-1.5 hover:bg-primary/10 rounded-lg transition-all"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close notifications"
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {/* Skeleton loading */}
          {loading && notifications.length === 0 && (
            <div className="px-4 py-3 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-2 h-2 bg-slate-200 rounded-full mt-1.5 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-200 rounded w-16" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <BellOff size={28} className="text-slate-400" />
              </div>
              <p className="font-semibold text-slate-700">All caught up!</p>
              <p className="text-sm text-slate-500 mt-1">You have no new notifications</p>
            </div>
          )}

          {/* Notification items */}
          {notifications.map((item) => (
            <NotificationItem key={item._id} item={item} />
          ))}

          {/* Load more */}
          {notifications.length > 0 && (
            <div className="p-4 text-center">
              {hasMore ? (
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                  {loading ? "Loading..." : "Load more"}
                </button>
              ) : (
                <p className="text-xs text-slate-400">You're all caught up</p>
              )}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-3 bg-slate-50">
          <Link
            to="/profile/notifications"
            onClick={onClose}
            className="block text-center text-xs font-semibold text-primary hover:underline py-1"
          >
            View all notifications →
          </Link>
        </div>
      </div>
    </>
  );
}
