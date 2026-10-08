import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  toggleFaqStatus,
} from "@/features/admin/adminSlice";
import {
  HelpCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  X,
  Layers,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminFAQs() {
  const dispatch = useDispatch();
  const { faqs, loading } = useSelector((state) => state.admin);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "General",
    order: 0,
    isActive: true,
  });

  const loadFaqs = () => {
    dispatch(fetchAdminFaqs({ search, category: categoryFilter }));
  };

  useEffect(() => {
    loadFaqs();
  }, [categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadFaqs();
  };

  const handleOpenAddModal = () => {
    setEditingFaq(null);
    setFormData({
      question: "",
      answer: "",
      category: "General",
      order: faqs.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question || "",
      answer: faq.answer || "",
      category: faq.category || "General",
      order: faq.order ?? 0,
      isActive: faq.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }

    try {
      if (editingFaq) {
        await dispatch(updateFaq({ id: editingFaq._id, data: formData })).unwrap();
        toast.success("FAQ updated successfully");
      } else {
        await dispatch(createFaq(formData)).unwrap();
        toast.success("FAQ created successfully");
      }
      setModalOpen(false);
      loadFaqs();
    } catch (err) {
      toast.error(err || "Failed to save FAQ");
    }
  };

  const handleToggleStatus = async (faq) => {
    try {
      await dispatch(toggleFaqStatus(faq._id)).unwrap();
      toast.success(`FAQ ${faq.isActive ? "deactivated" : "activated"}`);
      loadFaqs();
    } catch (err) {
      toast.error(err || "Failed to toggle status");
    }
  };

  const handleDeleteFaq = async (id) => {
    try {
      await dispatch(deleteFaq(id)).unwrap();
      toast.success("FAQ deleted successfully");
      setDeleteConfirmId(null);
      loadFaqs();
    } catch (err) {
      toast.error(err || "Failed to delete FAQ");
    }
  };

  const categories = Array.from(new Set(["General", "Cakes & Flavors", "Ordering", "Delivery", "Customization", ...(faqs || []).map((f) => f.category).filter(Boolean)]));

  const filteredFaqs = (faqs || []).filter((f) => {
    const matchesSearch =
      !search ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "all" || f.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-black">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">FAQ Management</h1>
            <p className="text-xs text-slate-500 font-medium">Manage customer FAQs, answers, order and visibility</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadFaqs}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-pink-600" : ""}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm shadow-md shadow-pink-600/20 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add FAQ
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search FAQs by question or answer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 text-slate-700 font-medium"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FAQs List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && filteredFaqs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="h-8 w-8 animate-spin text-pink-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-500">Loading FAQs...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <HelpCircle className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No FAQs Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search || categoryFilter !== "all"
                ? "No FAQs match your search criteria. Try resetting filters."
                : "Create your first FAQ to help customers find quick answers."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredFaqs.map((faq, index) => (
              <div
                key={faq._id || index}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-50 text-pink-700 border border-pink-100">
                      {faq.category || "General"}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Order: <strong className="text-slate-700">{faq.order ?? 0}</strong>
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        faq.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {faq.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{faq.question}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{faq.answer}</p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleToggleStatus(faq)}
                    className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                      faq.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    title={faq.isActive ? "Deactivate" : "Activate"}
                  >
                    {faq.isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(faq)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    title="Edit FAQ"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  {deleteConfirmId === faq._id ? (
                    <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-200">
                      <button
                        onClick={() => handleDeleteFaq(faq._id)}
                        className="px-2 py-1 bg-red-600 text-white text-[10px] font-black rounded-lg hover:bg-red-700"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-1 text-slate-500 hover:text-slate-800"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(faq._id)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                      title="Delete FAQ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit FAQ Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                  {editingFaq ? <Edit2 className="h-4.5 w-4.5" /> : <Plus className="h-4.5 w-4.5" />}
                </div>
                <h2 className="text-base font-black text-slate-900">
                  {editingFaq ? "Edit FAQ" : "Create New FAQ"}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Do you offer eggless options for your cakes?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Answer *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide a clear, detailed answer for your customers..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cakes & Flavors"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
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
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-bold text-slate-700 select-none">
                  Active (Visible to customers)
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
                  className="flex items-center gap-2 px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm rounded-xl shadow-md shadow-pink-600/20 transition-all active:scale-95"
                >
                  <Save className="h-4 w-4" />
                  {editingFaq ? "Save Changes" : "Create FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
