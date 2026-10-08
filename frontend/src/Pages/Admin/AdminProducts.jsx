import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminProducts, fetchAdminCategories, toggleProductStatus, hardDeleteProduct, toggleProductFlag, createProduct, updateProduct } from "@/features/admin/adminSlice";
import ProductModal from "@/components/admin/ProductModal";
import ConfirmModal from "@/components/admin/ConfirmModal";
import StatusBadge from "@/components/admin/StatusBadge";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Star, Flame, Award, Zap, RefreshCw, Power, PowerOff, Loader2 } from "lucide-react";
import { getImageUrl } from "@/lib/api";

const FLAGS = [
  { key: "isBestSeller", label: "Best Seller", icon: Award, color: "text-amber-600 bg-amber-100" },
  { key: "isTrending",   label: "Trending",    icon: Flame, color: "text-orange-600 bg-orange-100" },
  { key: "isFeatured",   label: "Featured",    icon: Star,  color: "text-violet-600 bg-violet-100" },
  { key: "isTodaySpecial", label: "Today Special", icon: Zap, color: "text-blue-600 bg-blue-100" },
];

export default function AdminProducts() {
  const dispatch = useDispatch();
  const { products, productsPagination, categories, loading } = useSelector(s => s.admin);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sort, setSort] = useState("createdAt:-1");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null);
  const [isDeletingPermanent, setIsDeletingPermanent] = useState(false);

  // Fetch products with full criteria
  useEffect(() => {
    dispatch(fetchAdminProducts({
      search,
      status: statusFilter !== "all" ? statusFilter : undefined,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
      sort,
      page,
      limit: 10
    }));
  }, [dispatch, search, statusFilter, categoryFilter, sort, page]);

  // Load categories on mount
  useEffect(() => {
    dispatch(fetchAdminCategories({ limit: 100 }));
  }, [dispatch]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleCategoryFilterChange = (val) => {
    setCategoryFilter(val);
    setPage(1);
  };

  const handleCreate = async (data) => {
    const res = await dispatch(createProduct(data));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Product created!");
      setModalOpen(false);
      // Reload current list
      dispatch(fetchAdminProducts({ search, status: statusFilter !== "all" ? statusFilter : undefined, category: categoryFilter !== "all" ? categoryFilter : undefined, sort, page, limit: 10 }));
    } else {
      toast.error(res.payload || "Failed to create product");
    }
  };

  const handleUpdate = async (data) => {
    const res = await dispatch(updateProduct({ id: editing._id, data }));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Product updated!");
      setEditing(null);
      // Reload current list
      dispatch(fetchAdminProducts({ search, status: statusFilter !== "all" ? statusFilter : undefined, category: categoryFilter !== "all" ? categoryFilter : undefined, sort, page, limit: 10 }));
    } else {
      toast.error(res.payload || "Failed to update product");
    }
  };

  const handleToggleStatus = async (product) => {
    if (actionLoadingId) return;
    const isCurrentlyActive = product.status === "active" || (product.isActive && product.status !== "inactive");
    const nextStatus = isCurrentlyActive ? "inactive" : "active";

    setActionLoadingId(product._id);
    try {
      const res = await dispatch(toggleProductStatus({ id: product._id, status: nextStatus }));
      if (res.meta.requestStatus === "fulfilled") {
        toast.success(nextStatus === "active" ? `"${product.name}" activated!` : `"${product.name}" deactivated!`);
      } else {
        toast.error(res.payload || "Failed to update product status");
      }
    } catch {
      toast.error("Failed to update product status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!permanentDeleteTarget || isDeletingPermanent) return;
    setIsDeletingPermanent(true);
    setActionLoadingId(permanentDeleteTarget._id);
    try {
      const res = await dispatch(hardDeleteProduct(permanentDeleteTarget._id));
      if (res.meta.requestStatus === "fulfilled") {
        toast.success(`"${permanentDeleteTarget.name}" permanently deleted.`);
        setPermanentDeleteTarget(null);
        // Reload current list
        dispatch(fetchAdminProducts({
          search,
          status: statusFilter !== "all" ? statusFilter : undefined,
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          sort,
          page,
          limit: 10
        }));
      } else {
        toast.error(res.payload || "Failed to permanently delete product");
      }
    } catch {
      toast.error("Failed to permanently delete product");
    } finally {
      setIsDeletingPermanent(false);
      setActionLoadingId(null);
    }
  };

  const handleToggleFlag = async (product, flag) => {
    const res = await dispatch(toggleProductFlag({ id: product._id, flag, value: !product[flag] }));
    if (res.meta.requestStatus !== "fulfilled") toast.error("Failed to toggle flag");
  };

  const totalProducts = productsPagination?.total || products.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-800">Products</h2>
          <p className="text-sm text-slate-500">{totalProducts} total products</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-semibold text-sm transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search products by name or description..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Categories Filter */}
        <select value={categoryFilter} onChange={e => handleCategoryFilterChange(e.target.value)}
          className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500">
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select value={statusFilter} onChange={e => handleStatusFilterChange(e.target.value)}
          className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Sorting Selection */}
        <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
          className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500">
          <option value="createdAt:-1">Newest First</option>
          <option value="createdAt:1">Oldest First</option>
          <option value="basePrice:1">Price: Low to High</option>
          <option value="basePrice:-1">Price: High to Low</option>
          <option value="rating:-1">Rating: High to Low</option>
        </select>

        <button onClick={() => dispatch(fetchAdminProducts({ search, status: statusFilter !== "all" ? statusFilter : undefined, category: categoryFilter !== "all" ? categoryFilter : undefined, sort, page, limit: 10 }))} 
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Product", "Base Price", "Discount", "Flags", "Status", "Actions"].map(h => (
                  <th key={h} className={`${h === "Actions" ? "text-right" : "text-left"} text-xs font-bold text-slate-500 px-5 py-3.5 whitespace-nowrap`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400">
                  <RefreshCw className="animate-spin mx-auto mb-2" size={20} />Loading products...
                </td></tr>
              )}
              {!loading && products.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400">No products found</td></tr>
              )}
              {products.map(product => (
                <tr key={product._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {product.thumbnail && (
                        <img src={getImageUrl(product.thumbnail)} alt={product.name} className="w-10 h-10 rounded-xl object-cover shrink-0 bg-slate-100" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate max-w-[180px]">{product.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-800">₹{product.basePrice?.toLocaleString()}</td>
                  <td className="px-5 py-4 text-slate-600">{product.discount || 0}%</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {FLAGS.map(({ key, label, icon: Icon, color }) => (
                        <button key={key} title={`Toggle ${label}`}
                          onClick={() => handleToggleFlag(product, key)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold transition-opacity ${product[key] ? color : "text-slate-400 bg-slate-100 opacity-50"}`}>
                          <Icon size={10} />
                          <span className="hidden md:inline">{label}</span>
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={product.status || (product.isActive ? "active" : "inactive")} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap sm:flex-nowrap">
                      {/* 1. Edit */}
                      <button
                        onClick={() => setEditing(product)}
                        disabled={!!actionLoadingId}
                        title="Edit Product"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Pencil size={13} className="text-slate-500" />
                        <span>Edit</span>
                      </button>

                      {/* 2. Activate / Deactivate */}
                      {(product.status === "inactive" || product.isActive === false) ? (
                        <button
                          onClick={() => handleToggleStatus(product)}
                          disabled={!!actionLoadingId}
                          title="Activate Product"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-700 font-medium text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {actionLoadingId === product._id ? (
                            <Loader2 size={13} className="animate-spin text-emerald-600" />
                          ) : (
                            <Power size={13} className="text-emerald-600" />
                          )}
                          <span>Activate</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(product)}
                          disabled={!!actionLoadingId}
                          title="Deactivate Product"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-700 font-medium text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {actionLoadingId === product._id ? (
                            <Loader2 size={13} className="animate-spin text-amber-600" />
                          ) : (
                            <PowerOff size={13} className="text-amber-600" />
                          )}
                          <span>Deactivate</span>
                        </button>
                      )}

                      {/* 3. Delete Permanently */}
                      <button
                        onClick={() => setPermanentDeleteTarget(product)}
                        disabled={!!actionLoadingId}
                        title="Permanently delete product and media"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50/60 hover:bg-red-100 text-red-700 font-medium text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {actionLoadingId === product._id && isDeletingPermanent ? (
                          <Loader2 size={13} className="animate-spin text-red-600" />
                        ) : (
                          <Trash2 size={13} className="text-red-600" />
                        )}
                        <span>Delete Permanently</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination UI */}
      {productsPagination && productsPagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 bg-white p-4 border border-slate-200 rounded-2xl">
          <p className="text-xs text-slate-500 font-semibold">
            Showing Page <span className="font-bold text-slate-800">{productsPagination.page}</span> of{" "}
            <span className="font-bold text-slate-800">{productsPagination.pages}</span> (Total{" "}
            <span className="font-bold text-slate-800">{productsPagination.total}</span> products)
          </p>
          <div className="flex gap-2">
            <button
              disabled={productsPagination.page <= 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              Previous
            </button>
            <button
              disabled={productsPagination.page >= productsPagination.pages}
              onClick={() => setPage(p => Math.min(p + 1, productsPagination.pages))}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} loading={loading} />
      <ProductModal open={!!editing} onClose={() => setEditing(null)} onSubmit={handleUpdate} initial={editing} loading={loading} />
      <ConfirmModal
        open={!!permanentDeleteTarget}
        title="Permanently Delete Product?"
        message="This will permanently delete the product and its associated images. This action cannot be undone."
        confirmKeyword="DELETE"
        confirmLabel="Delete Permanently"
        danger={true}
        loading={isDeletingPermanent}
        onConfirm={handlePermanentDelete}
        onCancel={() => !isDeletingPermanent && setPermanentDeleteTarget(null)}
      />
    </div>
  );
}
