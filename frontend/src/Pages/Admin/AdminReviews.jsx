import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminReviews, approveReview, deleteReview } from "@/features/admin/adminSlice";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { toast } from "sonner";
import { Star, RefreshCw, CheckCircle, Trash2 } from "lucide-react";

export default function AdminReviews() {
  const dispatch = useDispatch();
  const { reviews, loading } = useSelector(s => s.admin);
  const [filterApproved, setFilterApproved] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminReviews({ isApproved: filterApproved !== "all" ? filterApproved : undefined }));
  }, [dispatch, filterApproved]);

  const handleApprove = async (id) => {
    const res = await dispatch(approveReview(id));
    if (res.meta.requestStatus === "fulfilled") toast.success("Review approved!");
    else toast.error(res.payload || "Failed to approve review");
  };

  const handleDelete = async () => {
    const res = await dispatch(deleteReview(deleteTarget._id));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Review deleted");
      setDeleteTarget(null);
    } else {
      toast.error(res.payload || "Failed to delete review");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Reviews Moderation</h2>
          <p className="text-sm text-slate-500">{reviews.length} total review submissions</p>
        </div>
        <button onClick={() => dispatch(fetchAdminReviews({}))} className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["all", "true", "false"].map(opt => (
          <button key={opt} onClick={() => setFilterApproved(opt)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${filterApproved === opt ? "bg-pink-600 text-white" : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
            {opt === "all" ? "All Reviews" : opt === "true" ? "Approved Only" : "Pending Review"}
          </button>
        ))}
      </div>

      {/* Review Cards Grid */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          No review logs found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map(review => (
            <div key={review._id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                      {review.user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{review.user?.name || "Anonymous User"}</p>
                      <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase border
                    ${review.isApproved ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100 animate-pulse"}`}>
                    {review.isApproved ? "Approved" : "Pending"}
                  </span>
                </div>

                {/* Cake Reference */}
                <div className="text-xs text-slate-500 font-semibold bg-slate-50 rounded-lg px-2.5 py-1.5 inline-block">
                  🍰 Cake: <span className="text-pink-600 font-bold">{review.cake?.name || "Unknown Product"}</span>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} size={15} fill={idx < review.rating ? "currentColor" : "none"} className={idx < review.rating ? "text-amber-400" : "text-slate-300"} />
                  ))}
                </div>

                <p className="text-sm text-slate-600 leading-relaxed italic">"{review.comment || "No comment content provided."}"</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-100 mt-4 justify-end">
                {!review.isApproved && (
                  <button onClick={() => handleApprove(review._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors">
                    <CheckCircle size={13} /> Approve
                  </button>
                )}
                <button onClick={() => setDeleteTarget(review)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs transition-colors">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Review?"
        message="This review will be permanently deleted and the cake rating average will be recalculated."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
