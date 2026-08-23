import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ExternalLink, Package, ShoppingBag, ChevronRight,
  Calendar, Bell, Zap, AlertTriangle, Trash2
} from "lucide-react";
import {
  fetchNotificationBySlug,
  fetchNotificationById,
  clearCurrentNotification,
  deleteMyNotification,
} from "@/features/notifications/notificationSlice";
import { TYPE_CONFIG, timeAgo } from "@/components/notifications/NotificationCard";
import { toast } from "sonner";

// ── Priority configuration ─────────────────────────────────────────────────────
const PRIORITY_BANNER = {
  urgent: { pill: "bg-red-100 text-red-700 border-red-200",       icon: AlertTriangle },
  high:   { pill: "bg-orange-100 text-orange-700 border-orange-200", icon: Zap },
  medium: null,
  low:    null,
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const isObjectId = (str) => /^[a-f\d]{24}$/i.test(str);

// ── Detail Skeleton ────────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full h-52 sm:h-64 bg-slate-100" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <div className="flex gap-3">
          <div className="h-6 bg-slate-100 rounded-full w-24" />
          <div className="h-6 bg-slate-100 rounded-full w-32" />
        </div>
        <div className="h-8 bg-slate-100 rounded-xl w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-100 rounded-full w-full" />
          <div className="h-4 bg-slate-100 rounded-full w-5/6" />
          <div className="h-4 bg-slate-100 rounded-full w-4/6" />
        </div>
        <div className="h-14 bg-slate-100 rounded-2xl" />
      </div>
    </div>
  );
}

// ── Error State ────────────────────────────────────────────────────────────────
function NotFoundState({ message, onBack }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5 px-4 py-20">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
        <Bell size={32} className="text-red-300" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-black text-slate-800 mb-2">Notification Not Found</h2>
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
          {message || "This notification doesn't exist or may have expired."}
        </p>
      </div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold text-sm rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
      >
        <ArrowLeft size={16} /> Back to Notifications
      </button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function NotificationDetailPage() {
  const { slug } = useParams();   // could be a slug OR a legacy ObjectId
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentNotification, detailLoading, detailError } = useSelector(
    (s) => s.notifications
  );

  useEffect(() => {
    if (!slug) return;
    // Smart dispatch: use slug endpoint for slug strings, ObjectId endpoint for IDs
    if (isObjectId(slug)) {
      dispatch(fetchNotificationById(slug));
    } else {
      dispatch(fetchNotificationBySlug(slug));
    }
    return () => { dispatch(clearCurrentNotification()); };
  }, [slug, dispatch]);

  const handleDelete = async () => {
    if (!currentNotification) return;
    const notifId = currentNotification.notification?._id;
    try {
      await dispatch(deleteMyNotification(notifId)).unwrap();
      toast.success("Notification removed");
      navigate("/notifications");
    } catch {
      toast.error("Failed to remove notification");
    }
  };

  const handleGoBack = () => navigate("/notifications");

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (detailLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={18} /> Notifications
            </button>
          </div>
        </div>
        <DetailSkeleton />
      </div>
    );
  }

  // ── Error / Not Found ────────────────────────────────────────────────────────
  if (detailError || !currentNotification) {
    return <NotFoundState message={detailError} onBack={handleGoBack} />;
  }

  // ── Data ─────────────────────────────────────────────────────────────────────
  const { notification, isRead, readAt } = currentNotification;
  if (!notification) return <NotFoundState message="Notification data unavailable" onBack={handleGoBack} />;

  const {
    title, shortDescription, message, image, type, priority,
    buttonText, buttonLink, relatedProduct, relatedOrder, createdAt, sentAt
  } = notification;

  const typeConf = TYPE_CONFIG[type] || TYPE_CONFIG.custom;
  const priConf  = PRIORITY_BANNER[priority];
  const Icon     = typeConf.icon;

  const handleAction = () => {
    if (!buttonLink) return;
    if (buttonLink.startsWith("http")) window.open(buttonLink, "_blank");
    else navigate(buttonLink);
  };

  const productId = relatedProduct?._id || relatedProduct;
  const productSlug = relatedProduct?.slug;
  const orderId  = relatedOrder?._id || relatedOrder;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      {/* ── Sticky Back Bar ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Notifications</span>
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all"
          >
            <Trash2 size={13} />
            Remove
          </button>
        </div>
      </div>

      {/* ── Banner Image ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {image ? (
          <div className="relative w-full h-52 sm:h-72 overflow-hidden">
            <img src={image} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            {/* Type badge overlay */}
            <div className="absolute bottom-5 left-5 flex items-center gap-2">
              <div className={`w-9 h-9 rounded-xl ${typeConf.iconBg} flex items-center justify-center shadow-lg`}>
                <Icon size={18} className={typeConf.text} />
              </div>
              <span className={`text-[11px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg border ${typeConf.badge} backdrop-blur-sm`}>
                {typeConf.label}
              </span>
            </div>
          </div>
        ) : (
          <div className={`relative w-full h-44 sm:h-56 overflow-hidden ${typeConf.iconBg}`}>
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className={`w-16 h-16 rounded-3xl ${typeConf.iconBg} shadow-lg flex items-center justify-center border-4 border-white/60`}>
                <Icon size={28} className={typeConf.text} />
              </div>
              <span className={`text-sm font-black tracking-widest uppercase ${typeConf.text} opacity-80`}>
                {typeConf.label}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="max-w-2xl mx-auto px-4 sm:px-6 py-7"
      >
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {!image && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg border ${typeConf.badge}`}>
              {typeConf.label}
            </span>
          )}
          {priConf && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${priConf.pill}`}>
              <priConf.icon size={10} />
              {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium ml-auto">
            <Calendar size={12} />
            {new Date(sentAt || createdAt).toLocaleString(undefined, {
              month: "short", day: "numeric", year: "numeric",
              hour: "numeric", minute: "2-digit",
            })}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
          {title}
        </h1>

        {/* Short description */}
        {shortDescription && (
          <p className="text-base text-slate-600 font-medium leading-relaxed mb-5 pb-5 border-b border-slate-100">
            {shortDescription}
          </p>
        )}

        {/* Full message */}
        {message && (
          <div className="text-[15px] text-slate-600 leading-relaxed mb-6 space-y-3">
            {message.split("\n").map((line, i) =>
              line ? <p key={i}>{line}</p> : <br key={i} />
            )}
          </div>
        )}

        {/* Read status */}
        {isRead && readAt && (
          <p className="text-xs text-slate-400 mb-6 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            Read {timeAgo(readAt)}
          </p>
        )}

        {/* Related entities */}
        {(relatedProduct || relatedOrder) && (
          <div className="mb-7">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Related</h3>
            <div className="space-y-2">
              {relatedProduct && (
                <button
                  onClick={() => navigate(productSlug ? `/cake/${productSlug}` : `/shop`)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl group-hover:bg-indigo-200 transition-colors">
                      <ShoppingBag size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700">
                        {relatedProduct?.name || "View Product"}
                      </p>
                      <p className="text-xs text-slate-400">View related product</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {relatedOrder && (
                <button
                  onClick={() => navigate(`/profile?tab=orders&id=${orderId}`)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-200 transition-colors">
                      <Package size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">
                        {relatedOrder?.orderNumber ? `Order #${relatedOrder.orderNumber}` : "Track Order"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {relatedOrder?.orderStatus
                          ? relatedOrder.orderStatus.replace(/_/g, " ")
                          : "View order status"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* CTA Button */}
        {buttonText && buttonLink && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAction}
            className="w-full py-4 px-6 font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-200 hover:shadow-indigo-300 hover:shadow-xl"
          >
            {buttonText}
            <ExternalLink size={16} />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
