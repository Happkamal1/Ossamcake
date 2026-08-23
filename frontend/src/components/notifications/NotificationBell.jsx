import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { fetchUnreadCount } from "@/features/notifications/notificationSlice";
import { useAuth } from "@/context/AuthContext";

export default function NotificationBell() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const unreadCount = useSelector((state) => state.notifications.unreadCount);

  // Poll unread count on mount and every 60 seconds when user is authenticated
  useEffect(() => {
    if (!user) return;
    dispatch(fetchUnreadCount());
    const interval = setInterval(() => dispatch(fetchUnreadCount()), 60000);
    return () => clearInterval(interval);
  }, [user, dispatch]);

  // Only show for authenticated users
  if (!user) return null;

  return (
    <button
      id="notification-bell-btn"
      onClick={() => navigate("/notifications")}
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      className="relative p-1.5 sm:p-2 text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-full transition-all flex items-center justify-center group"
    >
      <Bell className="h-5 w-5 sm:h-5.5 sm:w-5.5 group-hover:scale-110 transition-transform" />

      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 min-w-[16px] h-4 sm:min-w-[20px] sm:h-5 px-0.5 rounded-full bg-primary text-primary-foreground text-[9px] sm:text-[10px] font-black flex items-center justify-center shadow-sm border-2 border-background animate-in zoom-in duration-300">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
