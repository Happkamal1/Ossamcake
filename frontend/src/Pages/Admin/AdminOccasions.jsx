import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOccasions, createOccasion, updateOccasion, deleteOccasion } from "@/features/admin/adminSlice";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { getImageUrl } from "@/lib/api";

export default function AdminOccasions() {
  const dispatch = useDispatch();
  const { occasions, loading } = useSelector(s => s.admin);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { dispatch(fetchAdminOccasions()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = { name, displayOrder: Number(displayOrder) };
    if (editing?.image) {
      data.image = editing.image;
    }
    let res;
    if (editing) {
      res = await dispatch(updateOccasion({ id: editing._id, data }));
    } else {
      res = await dispatch(createOccasion(data));
    }

    if (res.meta.requestStatus === "fulfilled") {
      toast.success(editing ? "Occasion updated" : "Occasion created");
      setName("");
      setDisplayOrder(0);
      setEditing(null);
    } else {
      toast.error(res.payload || "Failed to save occasion");
    }
  };

  const handleEditInit = (occ) => {
    setEditing(occ);
    setName(occ.name);
    setDisplayOrder(occ.displayOrder || 0);
  };

  const handleDelete = async () => {
    const res = await dispatch(deleteOccasion(deleteTarget._id));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Occasion deleted");
      setDeleteTarget(null);
    } else {
      toast.error(res.payload || "Failed to delete");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800">Occasions</h2>
            <p className="text-sm text-slate-500">{occasions.length} occasions</p>
          </div>
          <button onClick={() => dispatch(fetchAdminOccasions())} className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Image", "Name", "Slug", "Order", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-slate-500 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {occasions.map(occ => (
                <tr key={occ._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    {occ.image ? (
                      <img src={getImageUrl(occ.image)} alt={occ.name} className="w-9 h-9 rounded-xl object-cover bg-slate-100 border border-slate-200" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-bold">
                        {occ.name.charAt(0)}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{occ.name}</td>
                  <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{occ.slug}</td>
                  <td className="px-5 py-3.5 text-slate-600">{occ.displayOrder || 0}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${occ.isActive !== false ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {occ.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1">
                      <button onClick={() => handleEditInit(occ)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(occ)} className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors">
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

      <div className="bg-white rounded-2xl border border-slate-200 p-5 h-fit sticky top-6">
        <h3 className="text-base font-bold text-slate-800 mb-4">{editing ? "Edit Occasion" : "Add New Occasion"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {editing?.image && (
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Occasion Image</label>
              <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <img src={getImageUrl(editing.image)} alt={editing.name} className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200" />
                <p className="text-[11px] text-slate-500 font-mono truncate max-w-[180px]">{editing.image}</p>
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">Occasion Name *</label>
            <input required value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="e.g. Anniversary" />
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
        title="Delete Occasion?"
        message={`"${deleteTarget?.name}" occasion will be deactivated.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
