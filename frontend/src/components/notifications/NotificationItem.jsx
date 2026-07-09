import { useDispatch } from "react-redux";
import { markAsRead, deleteMyNotification, openNotificationModal } from "@/features/notifications/notificationSlice";
import { toast } from "sonner";
import { X, ExternalLink, ChevronRight } from "lucide-react";

const TYPE_CONFIG = {
  promotion:    { color: "bg-pink-100 text-pink-600 border-pink-200",    label: "Promo" },
  offer:        { color: "bg-orange-100 text-orange-600 border-orange-200", label: "Offer" },
  coupon:       { color: "bg-green-100 text-green-600 border-green-200",   label: "Coupon" },
  order:        { color: "bg-blue-100 text-blue-600 border-blue-200",     label: "Order" },
  security:     { color: "bg-red-100 text-red-600 border-red-200",       label: "Security" },
  account:      { color: "bg-purple-100 text-purple-600 border-purple-200", label: "Account" },
  system:       { color: "bg-gray-100 text-gray-600 border-gray-200",     label: "System" },
  announcement: { color: "bg-indigo-100 text-indigo-600 border-indigo-200", label: "Announcement" },
  custom:       { color: "bg-teal-100 text-teal-600 border-teal-200",     label: "Info" },
};

const PRIORITY_DOT = {
  low:    "bg-slate-300 shadow-slate-300/50",
  medium: "bg-blue-500 shadow-blue-500/50",
  high:   "bg-orange-500 shadow-orange-500/50",
  urgent: "bg-red-500 shadow-red-500/50 animate-pulse",
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)    return "Just now";
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days < 7)    return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function NotificationItem({ item }) {
  const dispatch = useDispatch();
  const { notification, isRead, createdAt } = item;

  if (!notification) return null;

  const typeConf = TYPE_CONFIG[notification.type] || TYPE_CONFIG.custom;
  const priorityDot = PRIORITY_DOT[notification.priority] || PRIORITY_DOT.medium;

  const handleRead = () => {
    if (!isRead) dispatch(markAsRead(notification._id));
    dispatch(openNotificationModal(item));
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    dispatch(deleteMyNotification(notification._id))
      .unwrap()
      .catch(() => toast.error("Could not delete notification"));
  };

  return (
    <div
      onClick={handleRead}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleRead()}
      className={`
        group relative flex gap-4 px-5 py-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
        ${isRead 
          ? "bg-white/80 border-slate-100 hover:border-slate-300 hover:shadow-md hover:bg-white" 
          : "bg-gradient-to-r from-indigo-50/80 to-blue-50/50 border-indigo-100 hover:border-indigo-300 hover:shadow-lg shadow-indigo-100/50"}
      `}
    >
      {/* Unread Glowing Edge indicator */}
      {!isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500" />
      )}

      {/* Priority dot & Type Icon Area */}
      <div className="flex-shrink-0 pt-1 relative">
        <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full shadow-sm border-2 border-white z-10 ${priorityDot}`} />
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs shadow-sm bg-white ${typeConf.color.split(' ')[1]} ${typeConf.color.split(' ')[2]}`}>
          {typeConf.label.charAt(0)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-8">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md border ${typeConf.color}`}>
            {typeConf.label}
          </span>
          <span className="text-[11px] font-medium text-slate-400 ml-auto flex-shrink-0">{timeAgo(createdAt)}</span>
        </div>

        <p className={`text-[15px] font-bold leading-snug mb-1 transition-colors ${isRead ? "text-slate-700 group-hover:text-slate-900" : "text-slate-900"}`}>
          {notification.title}
        </p>

        {notification.shortDescription && (
          <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed">
            {notification.shortDescription}
          </p>
        )}

        {notification.buttonText && notification.buttonLink && (
          <div className="flex items-center gap-1 mt-3 text-[13px] font-bold text-indigo-600 bg-indigo-50/50 w-fit px-3 py-1.5 rounded-lg group-hover:bg-indigo-100 transition-colors">
            {notification.buttonText}
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}
      </div>

      {/* Delete / Action Button */}
      <button
        onClick={handleDelete}
        title="Delete notification"
        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
      >
        <X size={16} />
      </button>
    </div>
  );
}
