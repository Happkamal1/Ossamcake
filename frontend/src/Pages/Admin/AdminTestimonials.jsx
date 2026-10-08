import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialStatus,
} from "@/features/admin/adminSlice";
import {
  Quote,
  Star,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  X,
  RefreshCw,
  User,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminTestimonials() {
  const dispatch = useDispatch();
  const { testimonials, loading } = useSelector((state) => state.admin);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "Customer",
    rating: 5,
    message: "",
    avatar: "",
    image: "",
    order: 0,
    isActive: true,
  });

  const loadTestimonials = () => {
    dispatch(fetchAdminTestimonials({ search }));
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTestimonials();
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      role: "Customer",
      rating: 5,
      message: "",
      avatar: "",
      image: "",
      order: testimonials.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      role: item.role || "Customer",
      rating: item.rating ?? 5,
      message: item.message || item.text || "",
      avatar: item.avatar || "",
      image: item.image || "",
      order: item.order ?? 0,
      isActive: item.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) {
      toast.error("Customer name and review message are required");
      return;
    }

    try {
      if (editingItem) {
        await dispatch(updateTestimonial({ id: editingItem._id, data: formData })).unwrap();
        toast.success("Testimonial updated successfully");
      } else {
        await dispatch(createTestimonial(formData)).unwrap();
        toast.success("Testimonial created successfully");
      }
      setModalOpen(false);
      loadTestimonials();
    } catch (err) {
      toast.error(err || "Failed to save testimonial");
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await dispatch(toggleTestimonialStatus(item._id)).unwrap();
      toast.success(`Testimonial ${item.isActive ? "deactivated" : "activated"}`);
      loadTestimonials();
    } catch (err) {
      toast.error(err || "Failed to toggle status");
    }
  };

  const handleDeleteTestimonial = async (id) => {
    try {
      await dispatch(deleteTestimonial(id)).unwrap();
      toast.success("Testimonial deleted successfully");
      setDeleteConfirmId(null);
      loadTestimonials();
    } catch (err) {
      toast.error(err || "Failed to delete testimonial");
    }
  };

  const filteredTestimonials = (testimonials || []).filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.role && t.role.toLowerCase().includes(q)) ||
      ((t.message || t.text) && (t.message || t.text).toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-black">
            <Quote className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Testimonials Management</h1>
            <p className="text-xs text-slate-500 font-medium">Manage featured customer stories, star ratings and roles</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTestimonials}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-purple-600" : ""}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Testimonial
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search testimonials by customer name, role, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </form>
      </div>

      {/* Testimonials Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && filteredTestimonials.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-500">Loading testimonials...</p>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <Quote className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No Testimonials Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your first featured customer review to display on the homepage.
            </p>
          </div>
        ) : (
          filteredTestimonials.map((item, idx) => (
            <div
              key={item._id || idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-4">
                  "{item.message || item.text}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-inner">
                    {item.avatar || (item.name ? item.name.slice(0, 2).toUpperCase() : "CU")}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">{item.role || "Customer"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                      item.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    title={item.isActive ? "Deactivate" : "Activate"}
                  >
                    {item.isActive ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  {deleteConfirmId === item._id ? (
                    <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                      <button
                        onClick={() => handleDeleteTestimonial(item._id)}
                        className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-0.5 text-slate-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(item._id)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  {editingItem ? <Edit2 className="h-4.5 w-4.5" /> : <Plus className="h-4.5 w-4.5" />}
                </div>
                <h2 className="text-base font-black text-slate-900">
                  {editingItem ? "Edit Testimonial" : "Add Testimonial"}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTestimonial} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aisha Rahman"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Role / Occasion
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bride, Birthday Parent"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Star Rating (1 - 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 text-slate-300 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= formData.rating ? "text-amber-400 fill-amber-400" : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">{formData.rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Review / Testimonial Message *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="The cake was amazing and everyone loved it..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Initials Avatar (e.g. AR)
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="Auto-generated if empty"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="testimonialActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="testimonialActive" className="text-xs font-bold text-slate-700 select-none">
                  Active (Visible on homepage and mobile stories)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-md shadow-purple-600/20 transition-all active:scale-95"
                >
                  <Save className="h-4 w-4" />
                  {editingItem ? "Save Changes" : "Create Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
