import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  X, ChevronRight, Bell, Tag, Ticket, Package, ShieldCheck, 
  Megaphone, Settings, Star, Zap, Gift 
} from "lucide-react";
import { deleteMyNotification } from "@/features/notifications/notificationSlice";
import { toast } from "sonner";

// ── Type Configuration ─────────────────────────────────────────────────────────
export const TYPE_CONFIG = {
  promotion:    { label: "Promo",        icon: Tag,       bg: "bg-pink-50",    text: "text-pink-600",   badge: "bg-pink-100 text-pink-700 border-pink-200",   iconBg: "bg-pink-100" },
  offer:        { label: "Offer",        icon: Gift,      bg: "bg-orange-50",  text: "text-orange-600", badge: "bg-orange-100 text-orange-700 border-orange-200", iconBg: "bg-orange-100" },
  coupon:       { label: "Coupon",       icon: Ticket,    bg: "bg-green-50",   text: "text-green-600",  badge: "bg-green-100 text-green-700 border-green-200",  iconBg: "bg-green-100" },
  order:        { label: "Order",        icon: Package,   bg: "bg-blue-50",    text: "text-blue-600",   badge: "bg-blue-100 text-blue-700 border-blue-200",    iconBg: "bg-blue-100" },
  security:     { label: "Security",     icon: ShieldCheck, bg: "bg-red-50",   text: "text-red-600",    badge: "bg-red-100 text-red-700 border-red-200",       iconBg: "bg-red-100" },
  account:      { label: "Account",      icon: Star,      bg: "bg-purple-50",  text: "text-purple-600", badge: "bg-purple-100 text-purple-700 border-purple-200", iconBg: "bg-purple-100" },
  system:       { label: "System",       icon: Settings,  bg: "bg-slate-50",   text: "text-slate-600",  badge: "bg-slate-100 text-slate-700 border-slate-200",  iconBg: "bg-slate-100" },
  announcement: { label: "Announcement", icon: Megaphone, bg: "bg-indigo-50",  text: "text-indigo-600", badge: "bg-indigo-100 text-indigo-700 border-indigo-200", iconBg: "bg-indigo-100" },
  custom:       { label: "Info",         icon: Bell,      bg: "bg-teal-50",    text: "text-teal-600",   badge: "bg-teal-100 text-teal-700 border-teal-200",     iconBg: "bg-teal-100" },
};

const PRIORITY_CONFIG = {
  low:    { dot: "bg-slate-400",  label: null },
  medium: { dot: "bg-blue-500",   label: null },
  high:   { dot: "bg-orange-500", label: "High",   pill: "bg-orange-50 text-orange-600 border-orange-200" },
  urgent: { dot: "bg-red-500 animate-pulse", label: "Urgent", pill: "bg-red-50 text-red-600 border-red-200" },
};

export function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  === 1) return "Yesterday";
  if (days  < 7)  return `${days}d ago`;
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function NotificationCard({ item, index = 0 }) {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { notification, isRead, createdAt } = item;

  if (!notification) return null;

  const typeConf = TYPE_CONFIG[notification.type] || TYPE_CONFIG.custom;
  const priConf  = PRIORITY_CONFIG[notification.priority] || PRIORITY_CONFIG.medium;
  const Icon     = typeConf.icon;

  const handleClick = () => {
    // Navigate using SEO-friendly slug. Fall back to _id for legacy records.
    const identifier = notification.slug || notification._id;
    const path = notification.slug
      ? `/notifications/${notification.slug}`
      : `/notifications/${notification._id}`;
    navigate(path);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    dispatch(deleteMyNotification(notification._id))
      .unwrap()
      .catch(() => toast.error("Could not delete notification"));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      className={`
        group relative flex gap-4 p-5 rounded-2xl border cursor-pointer overflow-hidden
        transition-all duration-300 ease-out
        hover:-translate-y-0.5 hover:shadow-lg
        ${isRead
          ? "bg-white border-slate-100 hover:border-slate-200 hover:shadow-slate-100/80"
          : "bg-gradient-to-r from-indigo-50/70 via-blue-50/40 to-purple-50/30 border-indigo-100 hover:border-indigo-200 shadow-sm shadow-indigo-100/50 hover:shadow-indigo-100"
        }
      `}
    >
      {/* Unread left accent bar */}
      {!isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-blue-500 to-purple-500 rounded-l-2xl" />
      )}

      {/* Type icon */}
      <div className="relative flex-shrink-0">
        <div className={`w-12 h-12 rounded-2xl ${typeConf.iconBg} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={22} className={typeConf.text} />
        </div>
        {/* Priority dot */}
        <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${priConf.dot}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-8">
        {/* Row 1: type badge + priority pill + time */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className={`inline-flex items-center gap-1 text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md border ${typeConf.badge}`}>
            {typeConf.label}
          </span>
          {priConf.label && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${priConf.pill}`}>
              <Zap size={9} />
              {priConf.label}
            </span>
          )}
          <span className="text-[11px] text-slate-400 font-medium ml-auto flex-shrink-0">
            {timeAgo(createdAt)}
          </span>
        </div>

        {/* Row 2: title */}
        <p className={`text-[15px] font-bold leading-snug mb-1 transition-colors ${isRead ? "text-slate-700 group-hover:text-slate-900" : "text-slate-900"}`}>
          {notification.title}
        </p>

        {/* Row 3: short description */}
        {notification.shortDescription && (
          <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed">
            {notification.shortDescription}
          </p>
        )}

        {/* Row 4: CTA */}
        {notification.buttonText && (
          <div className={`inline-flex items-center gap-1 mt-3 text-[12px] font-bold px-3 py-1.5 rounded-lg transition-all ${typeConf.iconBg} ${typeConf.text}`}>
            {notification.buttonText}
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        title="Remove notification"
        className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0"
        aria-label="Delete notification"
      >
        <X size={14} />
      </button>

      {/* Unread dot */}
      {!isRead && (
        <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-indigo-500 opacity-80" />
      )}
    </motion.div>
  );
}
