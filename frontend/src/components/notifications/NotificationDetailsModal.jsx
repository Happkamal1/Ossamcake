import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { X, ExternalLink, Package, ShoppingBag, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { closeNotificationModal } from "@/features/notifications/notificationSlice";

const TYPE_COLORS = {
  promotion:    "bg-pink-100 text-pink-600 border-pink-200",
  offer:        "bg-orange-100 text-orange-600 border-orange-200",
  coupon:       "bg-green-100 text-green-600 border-green-200",
  order:        "bg-blue-100 text-blue-600 border-blue-200",
  security:     "bg-red-100 text-red-600 border-red-200",
  account:      "bg-purple-100 text-purple-600 border-purple-200",
  system:       "bg-gray-100 text-gray-600 border-gray-200",
  announcement: "bg-indigo-100 text-indigo-600 border-indigo-200",
  custom:       "bg-teal-100 text-teal-600 border-teal-200",
};

export default function NotificationDetailsModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeNotification } = useSelector((s) => s.notifications);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && dispatch(closeNotificationModal());
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [dispatch]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeNotification) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [activeNotification]);

  if (!activeNotification) return null;

  const {
    title, shortDescription, message, image, type,
    buttonText, buttonLink, relatedProduct, relatedOrder, createdAt
  } = activeNotification.notification;

  const typeColor = TYPE_COLORS[type] || TYPE_COLORS.custom;

  const handleClose = () => dispatch(closeNotificationModal());

  const handleActionClick = () => {
    handleClose();
    if (buttonLink) {
      if (buttonLink.startsWith("http")) window.open(buttonLink, "_blank");
      else navigate(buttonLink);
    }
  };

  const handleRelatedClick = (path) => {
    handleClose();
    navigate(path);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
        
        {/* Backdrop (click to close) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={handleClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          {/* Banner Image */}
          {image ? (
            <div className="w-full h-48 sm:h-56 bg-slate-100 relative shrink-0">
              <img src={image} alt={title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          ) : (
            <div className="w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative shrink-0">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:16px_16px]" />
            </div>
          )}

          {/* Scrollable Content */}
          <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 relative bg-white">
            
            {/* Type & Date */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md border ${typeColor}`}>
                {type}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {new Date(createdAt).toLocaleString(undefined, {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                })}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-black text-slate-900 leading-tight mb-2">
              {title}
            </h2>

            {/* Short Desc (if no message is provided, though usually both exist) */}
            {shortDescription && !message && (
              <p className="text-[15px] text-slate-500 font-medium leading-relaxed mt-2">
                {shortDescription}
              </p>
            )}

            {/* Full Message (Supports line breaks) */}
            {message && (
              <div className="mt-4 text-[15px] text-slate-600 leading-relaxed space-y-4 whitespace-pre-wrap">
                {message}
              </div>
            )}

            {/* Related Entities Links */}
            {(relatedProduct || relatedOrder) && (
              <div className="mt-8 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Related</h4>
                {relatedProduct && (
                  <button 
                    onClick={() => handleRelatedClick(`/shop/${relatedProduct}`)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-700 group-hover:text-indigo-700">
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition-colors">
                        <ShoppingBag size={16} />
                      </div>
                      View Related Product
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
                
                {relatedOrder && (
                  <button 
                    onClick={() => handleRelatedClick(`/profile?tab=orders&id=${relatedOrder}`)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-700 group-hover:text-blue-700">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Package size={16} />
                      </div>
                      Track Related Order
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Fixed Footer for Main Action Button */}
          {buttonText && buttonLink && (
            <div className="p-4 sm:p-6 bg-white border-t border-slate-100 shrink-0">
              <button
                onClick={handleActionClick}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                {buttonText}
                <ExternalLink size={16} />
              </button>
            </div>
          )}
          
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
