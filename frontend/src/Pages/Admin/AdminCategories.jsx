import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminCategories, createCategory, updateCategory, deleteCategory } from "@/features/admin/adminSlice";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";

export default function AdminCategories() {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector(s => s.admin);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { dispatch(fetchAdminCategories()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = { name, displayOrder: Number(displayOrder) };
    let res;
    if (editing) {
      res = await dispatch(updateCategory({ id: editing._id, data }));
    } else {
      res = await dispatch(createCategory(data));
    }

    if (res.meta.requestStatus === "fulfilled") {
      toast.success(editing ? "Category updated" : "Category created");
      setName("");
      setDisplayOrder(0);
      setEditing(null);
    } else {
      toast.error(res.payload || "Failed to save category");
    }
  };

  const handleEditInit = (cat) => {
    setEditing(cat);
    setName(cat.name);
    setDisplayOrder(cat.displayOrder || 0);
  };

  const handleDelete = async () => {
    const res = await dispatch(deleteCategory(deleteTarget._id));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Category deleted");
      setDeleteTarget(null);
    } else {
      toast.error(res.payload || "Failed to delete");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Category List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800">Categories</h2>
            <p className="text-sm text-slate-500">{categories.length} categories</p>
          </div>
          <button onClick={() => dispatch(fetchAdminCategories())} className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Name", "Slug", "Order", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-slate-500 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{cat.name}</td>
                  <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{cat.slug}</td>
                  <td className="px-5 py-3.5 text-slate-600">{cat.displayOrder || 0}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${cat.isActive !== false ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {cat.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1">
                      <button onClick={() => handleEditInit(cat)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(cat)} className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 h-fit sticky top-6">
        <h3 className="text-base font-bold text-slate-800 mb-4">{editing ? "Edit Category" : "Add New Category"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">Category Name *</label>
            <input required value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="e.g. Birthday Cakes" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">Display Order</label>
            <input type="number" min="0" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
          </div>
          <div className="flex gap-2 pt-2">
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setName(""); setDisplayOrder(0); }}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            )}
            <button type="submit" disabled={loading}
              className="flex-1 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1">
              <Plus size={14} /> {editing ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Category?"
        message={`"${deleteTarget?.name}" category will be deactivated.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
