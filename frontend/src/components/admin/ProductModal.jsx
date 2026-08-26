import { useState, useEffect } from "react";
import { X, Plus, Trash2, Upload, Image as ImageIcon, Sparkles, Truck, Tag, Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminCategories, fetchAdminOccasions, fetchAdminCakeTypes } from "@/features/admin/adminSlice";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";

const EMPTY = {
  name: "",
  description: "",
  basePrice: "",
  discount: 0,
  thumbnail: "",
  gallery: [],
  categories: [],
  occasions: [],
  cakeTypes: [],
  status: "active",
  isBestSeller: false,
  isFeatured: false,
  isTrending: false,
  isTodaySpecial: false,
  isNewArrival: false,
  egglessAvailable: true,
  egglessPremium: 0,
  isSameDayDelivery: false,
  deliveryTimeInfo: "",
  variants: [],
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: []
  },
  seoKeywordsText: ""
};

export default function ProductModal({ open, onClose, onSubmit, initial, loading }) {
  const dispatch = useDispatch();
  const { categories, occasions, cakeTypes } = useSelector(s => s.admin);
  
  const [activeTab, setActiveTab] = useState("basic");
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  // Fetch dynamic categories/occasions/types
  useEffect(() => {
    if (open) {
      if (!categories.length) dispatch(fetchAdminCategories({ limit: 100 }));
      if (!occasions.length) dispatch(fetchAdminOccasions({ limit: 100 }));
      if (!cakeTypes.length) dispatch(fetchAdminCakeTypes({ limit: 100 }));
    }
  }, [open, dispatch, categories.length, occasions.length, cakeTypes.length]);

  // Load initial product data if editing
  useEffect(() => {
    if (initial) {
      setForm({
        ...EMPTY,
        ...initial,
        categories: Array.isArray(initial.categories) ? initial.categories.map(c => typeof c === 'object' ? c._id : c) : [],
        occasions: Array.isArray(initial.occasions) ? initial.occasions.map(o => typeof o === 'object' ? o._id : o) : [],
        cakeTypes: Array.isArray(initial.cakeTypes) ? initial.cakeTypes.map(t => typeof t === 'object' ? t._id : t) : [],
        variants: Array.isArray(initial.variants) ? initial.variants.map(v => ({
          flavor: v.flavor || "",
          size: v.size || "",
          price: v.price || "",
          discountPrice: v.discountPrice || "",
          stock: v.stock ?? 10,
          sku: v.sku || "",
          status: v.status || "active"
        })) : [],
        seo: {
          metaTitle: initial.seo?.metaTitle || initial.seo?.title || "",
          metaDescription: initial.seo?.metaDescription || initial.seo?.description || "",
          keywords: Array.isArray(initial.seo?.keywords) ? initial.seo.keywords : []
        },
        seoKeywordsText: Array.isArray(initial.seo?.keywords) ? initial.seo.keywords.join(", ") : ""
      });
    } else {
      setForm(EMPTY);
    }
    setActiveTab("basic");
  }, [initial, open]);

  if (!open) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCheckboxToggle = (listName, id) => {
    setForm(f => {
      const current = f[listName] || [];
      const updated = current.includes(id)
        ? current.filter(x => x !== id)
        : [...current, id];
      return { ...f, [listName]: updated };
    });
  };

  // Image Upload handler
  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/admin/products/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      const uploadedUrl = res.data?.data?.url;
      if (uploadedUrl) {
        if (field === "thumbnail") {
          set("thumbnail", uploadedUrl);
          toast.success("Thumbnail uploaded successfully!");
        } else if (field === "gallery") {
          setForm(f => ({ ...f, gallery: [...f.gallery, uploadedUrl] }));
          toast.success("Image added to gallery!");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Variants management
  const addVariant = () => {
    setForm(f => ({
      ...f,
      variants: [...f.variants, { flavor: "", size: "", price: "", discountPrice: "", stock: 10, sku: "", status: "active" }]
    }));
  };

  const removeVariant = (index) => {
    setForm(f => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index, key, val) => {
    setForm(f => {
      const updated = [...f.variants];
      updated[index] = { ...updated[index], [key]: val };
      return { ...f, variants: updated };
    });
  };

  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    setForm(f => ({ ...f, gallery: [...f.gallery, newGalleryUrl.trim()] }));
    setNewGalleryUrl("");
  };

  const handleRemoveGalleryUrl = (index) => {
    setForm(f => ({ ...f, gallery: f.gallery.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.variants.length === 0) {
      toast.error("At least one variant is required");
      return;
    }
    
    // Validate variant inputs
    for (let i = 0; i < form.variants.length; i++) {
      const v = form.variants[i];
      if (!v.flavor.trim() || !v.size.trim() || !v.price) {
        toast.error(`Variant #${i + 1} has incomplete fields (flavor, weight/size, and price are required)`);
        return;
      }
    }

    const payload = {
      ...form,
      basePrice: parseFloat(form.basePrice) || 0,
      discount: parseFloat(form.discount) || 0,
      egglessPremium: parseFloat(form.egglessPremium) || 0,
      variants: form.variants.map(v => ({
        flavor: v.flavor.trim(),
        size: v.size.trim(),
        price: parseFloat(v.price) || 0,
        discountPrice: v.discountPrice ? parseFloat(v.discountPrice) : undefined,
        stock: parseInt(v.stock) ?? 10,
        sku: v.sku.trim() || undefined,
        status: v.status || "active"
      })),
      seo: {
        metaTitle: form.seo?.metaTitle?.trim() || form.name.trim(),
        metaDescription: form.seo?.metaDescription?.trim() || form.description.substring(0, 150).trim(),
        keywords: form.seoKeywordsText
          ? form.seoKeywordsText.split(",").map(k => k.trim()).filter(Boolean)
          : []
      }
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{initial ? "Edit Product" : "New Product"}</h2>
            <p className="text-xs text-slate-400">Fill in all fields to sync directly with MongoDB Atlas</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-50 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-4">
          {[
            { id: "basic", label: "Basic Info", icon: Sparkles },
            { id: "variants", label: "Variants", icon: Tag },
            { id: "images", label: "Images & Gallery", icon: ImageIcon },
            { id: "customization", label: "Customization & Delivery", icon: Truck },
            { id: "seo", label: "SEO Settings", icon: Heart }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold border-b-2 transition-all -mb-px ${activeTab === tab.id ? "border-pink-600 text-pink-600 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: Basic Info */}
          {activeTab === "basic" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 mb-1.5 block">Product Name *</label>
                  <input
                    required value={form.name} onChange={e => set("name", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="e.g. Premium Chocolate Fudge Cake"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1.5 block">Status</label>
                  <select
                    value={form.status} onChange={e => set("status", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1.5 block">Base Price (₹) *</label>
                  <input
                    required type="number" min="0" step="any" value={form.basePrice} onChange={e => set("basePrice", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="499"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1.5 block">Discount (%)</label>
                  <input
                    type="number" min="0" max="100" value={form.discount} onChange={e => set("discount", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Description *</label>
                <textarea
                  required rows={4} value={form.description} onChange={e => set("description", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                  placeholder="Describe the mouthwatering details of this cake..."
                />
              </div>

              {/* Dynamic Categorization Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3 border-t border-slate-100">
                <div>
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2.5">Categories</h4>
                  <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-xl p-3 space-y-2 bg-slate-50">
                    {categories.map(c => (
                      <label key={c._id} className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-600 hover:text-slate-900">
                        <input
                          type="checkbox"
                          checked={form.categories.includes(c._id)}
                          onChange={() => handleCheckboxToggle("categories", c._id)}
                          className="w-4 h-4 accent-pink-600 rounded"
                        />
                        {c.name}
                      </label>
                    ))}
                    {categories.length === 0 && <p className="text-xs text-slate-400 italic">No categories found</p>}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2.5">Occasions</h4>
                  <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-xl p-3 space-y-2 bg-slate-50">
                    {occasions.map(o => (
                      <label key={o._id} className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-600 hover:text-slate-900">
                        <input
                          type="checkbox"
                          checked={form.occasions.includes(o._id)}
                          onChange={() => handleCheckboxToggle("occasions", o._id)}
                          className="w-4 h-4 accent-pink-600 rounded"
                        />
                        {o.name}
                      </label>
                    ))}
                    {occasions.length === 0 && <p className="text-xs text-slate-400 italic">No occasions found</p>}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2.5">Cake Types</h4>
                  <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-xl p-3 space-y-2 bg-slate-50">
                    {cakeTypes.map(t => (
                      <label key={t._id} className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-600 hover:text-slate-900">
                        <input
                          type="checkbox"
                          checked={form.cakeTypes.includes(t._id)}
                          onChange={() => handleCheckboxToggle("cakeTypes", t._id)}
                          className="w-4 h-4 accent-pink-600 rounded"
                        />
                        {t.name}
                      </label>
                    ))}
                    {cakeTypes.length === 0 && <p className="text-xs text-slate-400 italic">No cake types found</p>}
                  </div>
                </div>
              </div>

              {/* Promotion flags */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">Promotion Flags</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    ["isBestSeller", "Best Seller"],
                    ["isFeatured", "Featured"],
                    ["isTrending", "Trending"],
                    ["isTodaySpecial", "Today Special"],
                    ["isNewArrival", "New Arrival"],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 border border-slate-100 rounded-xl p-3 bg-slate-50 hover:bg-slate-100/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox" checked={form[key] || false} onChange={e => set(key, e.target.checked)}
                        className="w-4 h-4 accent-pink-600 rounded"
                      />
                      <span className="text-xs font-semibold text-slate-700 select-none">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Variants */}
          {activeTab === "variants" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Product Variants *</h3>
                  <p className="text-xs text-slate-400">At least one variant must be created (e.g. flavor, weight, price, and stock)</p>
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold text-xs transition-colors"
                >
                  <Plus size={14} /> Add Variant
                </button>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Flavor *</th>
                        <th className="p-3">Weight/Size *</th>
                        <th className="p-3">Price (₹) *</th>
                        <th className="p-3">Disc. Price (₹)</th>
                        <th className="p-3 w-20">Stock</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-center">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.variants.map((v, i) => (
                        <tr key={i} className="border-b border-slate-200/55 hover:bg-white transition-colors">
                          <td className="p-2">
                            <input
                              required
                              value={v.flavor}
                              onChange={e => updateVariant(i, "flavor", e.target.value)}
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                              placeholder="e.g. Chocolate Fudge"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              required
                              value={v.size}
                              onChange={e => updateVariant(i, "size", e.target.value)}
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                              placeholder="e.g. 1 kg"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              required
                              type="number"
                              min="0"
                              step="any"
                              value={v.price}
                              onChange={e => updateVariant(i, "price", e.target.value)}
                              className="w-24 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                              placeholder="499"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={v.discountPrice}
                              onChange={e => updateVariant(i, "discountPrice", e.target.value)}
                              className="w-24 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                              placeholder="449"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              required
                              type="number"
                              min="0"
                              value={v.stock}
                              onChange={e => updateVariant(i, "stock", e.target.value)}
                              className="w-16 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                              placeholder="10"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              value={v.sku}
                              onChange={e => updateVariant(i, "sku", e.target.value)}
                              className="w-28 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                              placeholder="SKU-CHOC-1KG"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={v.status}
                              onChange={e => updateVariant(i, "status", e.target.value)}
                              className="border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 bg-white"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeVariant(i)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {form.variants.length === 0 && (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                            No variants added yet. Click "Add Variant" above to define options.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Images & Gallery */}
          {activeTab === "images" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Thumbnail Image */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2 space-y-3">
                  <label className="text-xs font-bold text-slate-600 block">Thumbnail Image *</label>
                  <div className="flex gap-2">
                    <input
                      required
                      value={form.thumbnail}
                      onChange={e => set("thumbnail", e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Enter absolute URL path or upload a file (e.g. /images/cakes/chocolate.jpg)"
                    />
                    <label className="flex items-center gap-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold text-sm cursor-pointer transition-colors border border-slate-200 whitespace-nowrap">
                      <Upload size={15} />
                      Upload File
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        onChange={e => handleImageUpload(e, "thumbnail")}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-slate-400">Supported formats: JPEG, PNG, WEBP (Max 10MB)</p>
                </div>
                
                {/* Thumbnail Preview */}
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50 flex flex-col items-center justify-center min-h-[140px]">
                  {form.thumbnail ? (
                    <div className="relative group rounded-xl overflow-hidden shadow-sm border border-slate-200">
                      <img src={form.thumbnail} alt="Thumbnail preview" className="max-h-24 max-w-full object-contain" />
                      <button
                        type="button"
                        onClick={() => set("thumbnail", "")}
                        className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon size={30} className="mx-auto mb-1.5 opacity-40" />
                      <span className="text-xs">No preview available</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Images */}
              <div className="pt-5 border-t border-slate-100 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Gallery Images</h4>
                  <p className="text-xs text-slate-400">Add secondary images to display on the Product Details slideshow</p>
                </div>

                <div className="flex gap-2">
                  <input
                    value={newGalleryUrl}
                    onChange={e => setNewGalleryUrl(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter image URL to add to gallery"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryUrl}
                    className="px-4 py-2.5 bg-slate-800 text-white font-bold text-sm rounded-xl hover:bg-slate-900 transition-colors"
                  >
                    Add URL
                  </button>
                  <label className="flex items-center gap-1 px-4 py-2.5 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-xl font-bold text-sm cursor-pointer transition-colors border border-pink-100 whitespace-nowrap">
                    <Upload size={15} />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={e => handleImageUpload(e, "gallery")}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Gallery List & Previews */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  {form.gallery.map((url, index) => (
                    <div key={index} className="relative group border border-slate-200 rounded-xl overflow-hidden aspect-square bg-slate-50 flex items-center justify-center p-2 shadow-sm">
                      <img src={url} alt={`Gallery ${index}`} className="max-h-full max-w-full object-contain" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryUrl(index)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                  {form.gallery.length === 0 && (
                    <div className="col-span-full border border-dashed border-slate-200 rounded-xl py-6 text-center text-slate-400 italic text-xs">
                      No gallery images uploaded.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: Customization & Delivery */}
          {activeTab === "customization" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Eggless options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-slate-100 rounded-2xl bg-slate-50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <input
                      id="egglessAvailable"
                      type="checkbox"
                      checked={form.egglessAvailable}
                      onChange={e => set("egglessAvailable", e.target.checked)}
                      className="w-4 h-4 accent-pink-600 rounded"
                    />
                    <label htmlFor="egglessAvailable" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                      Eggless Option Available
                    </label>
                  </div>
                  <p className="text-xs text-slate-400 pl-6">Check this if customers can choose to make this cake eggless</p>
                </div>

                {form.egglessAvailable && (
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Eggless Premium Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.egglessPremium}
                      onChange={e => set("egglessPremium", e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                      placeholder="0.0"
                    />
                    <p className="text-xs text-slate-400 mt-1">Extra cost added to the bill when selecting eggless</p>
                  </div>
                )}
              </div>

              {/* Delivery custom fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="md:col-span-1 border border-slate-100 rounded-2xl p-4 bg-slate-50">
                  <div className="flex items-center gap-2 cursor-pointer mb-2">
                    <input
                      id="isSameDayDelivery"
                      type="checkbox"
                      checked={form.isSameDayDelivery}
                      onChange={e => set("isSameDayDelivery", e.target.checked)}
                      className="w-4 h-4 accent-pink-600 rounded"
                    />
                    <label htmlFor="isSameDayDelivery" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                      Same-Day Delivery
                    </label>
                  </div>
                  <p className="text-xs text-slate-400">Can this cake be delivered on the same day the order is placed?</p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 mb-1.5 block">Delivery Schedule & Time Info</label>
                  <input
                    value={form.deliveryTimeInfo}
                    onChange={e => set("deliveryTimeInfo", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="e.g. Delivered within 4 hours, or Book 24 hours in advance"
                  />
                  <p className="text-xs text-slate-400 mt-1">Displayed to users during checkout and on details page</p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: SEO */}
          {activeTab === "seo" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Search Engine Optimization (SEO)</h3>
                <p className="text-xs text-slate-400">Increase discoverability on search engines like Google</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Meta Title</label>
                <input
                  value={form.seo.metaTitle}
                  onChange={e => setForm(f => ({ ...f, seo: { ...f.seo, metaTitle: e.target.value } }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Defaults to product name if empty"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Meta Description</label>
                <textarea
                  rows={3}
                  value={form.seo.metaDescription}
                  onChange={e => setForm(f => ({ ...f, seo: { ...f.seo, metaDescription: e.target.value } }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                  placeholder="Defaults to short description if empty"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Keywords (comma-separated)</label>
                <input
                  value={form.seoKeywordsText}
                  onChange={e => set("seoKeywordsText", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="chocolate cake, luxury desserts, anniversary, eggless cake"
                />
              </div>
            </div>
          )}

        </form>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 p-5 flex gap-3 bg-slate-50 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            onClick={handleSubmit}
            className="px-8 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm transition-colors disabled:opacity-60 flex items-center gap-1.5"
          >
            {loading ? "Saving..." : initial ? "Update Product" : "Create Product"}
          </button>
        </div>

      </div>
    </div>
  );
}
