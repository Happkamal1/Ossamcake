import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminBanners, createBanner, updateBanner, deleteBanner } from "@/features/admin/adminSlice";
import { bannersApi } from "@/features/admin/adminApi";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { toast } from "sonner";
import { 
  Plus, Trash2, Layers, Calendar, Image as ImageIcon, Search, 
  Filter, Eye, Edit2, Move, ArrowUp, ArrowDown, Settings, 
  Sparkles, Check, X, Upload, Loader2, Link2
} from "lucide-react";

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return 'http://localhost:5000' + url;
};

export default function AdminBanners() {
  const dispatch = useDispatch();
  const { banners, loading } = useSelector((s) => s.admin);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null);

  // Search, filtering, and query states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form states
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Responsive images
  const [desktopImage, setDesktopImage] = useState("");
  const [desktopImageId, setDesktopImageId] = useState("");
  const [tabletImage, setTabletImage] = useState("");
  const [tabletImageId, setTabletImageId] = useState("");
  const [mobileImage, setMobileImage] = useState("");
  const [mobileImageId, setMobileImageId] = useState("");

  // Upload progress states
  const [uploading, setUploading] = useState({ desktop: false, tablet: false, mobile: false });

  // CTAs
  const [primaryButtonText, setPrimaryButtonText] = useState("");
  const [primaryButtonLink, setPrimaryButtonLink] = useState("");
  const [secondaryButtonText, setSecondaryButtonText] = useState("");
  const [secondaryButtonLink, setSecondaryButtonLink] = useState("");

  // Styling & Customization
  const [bgOverlayColor, setBgOverlayColor] = useState("rgba(0, 0, 0, 0.4)");
  const [backgroundGradient, setBackgroundGradient] = useState("from-pink-500/10 via-background to-purple-500/10");
  const [textAlignment, setTextAlignment] = useState("center");
  const [buttonStyle, setButtonStyle] = useState("solid");
  const [animationType, setAnimationType] = useState("fade");
  const [theme, setTheme] = useState("light");

  // Dynamic Highlights & Lists
  const [rating, setRating] = useState(4.9);
  const [deliveryInfo, setDeliveryInfo] = useState("Same Day Delivery");
  const [trustBadges, setTrustBadges] = useState([]);
  const [floatingCards, setFloatingCards] = useState([]);

  // Temp states for array builders
  const [tempCardText, setTempCardText] = useState("");
  const [tempCardIcon, setTempCardIcon] = useState("Star");
  const [tempCardPos, setTempCardPos] = useState("top-left");

  const [tempBadgeLabel, setTempBadgeLabel] = useState("");
  const [tempBadgeDesc, setTempBadgeDesc] = useState("");
  const [tempBadgeIcon, setTempBadgeIcon] = useState("Fresh");

  // Scheduling & Ordering
  const [position, setPosition] = useState("home-hero");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [status, setStatus] = useState("active");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Badges & Offers
  const [badge, setBadge] = useState("");
  const [offerLabel, setOfferLabel] = useState("");
  const [couponCode, setCouponCode] = useState("");

  // Tab management inside Form Modal
  const [activeTab, setActiveTab] = useState("content");

  useEffect(() => {
    dispatch(fetchAdminBanners({ search: searchTerm, status: statusFilter === "all" ? undefined : statusFilter }));
  }, [dispatch, searchTerm, statusFilter]);

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle("");
    setSubtitle("");
    setDescription("");
    setDesktopImage("");
    setDesktopImageId("");
    setTabletImage("");
    setTabletImageId("");
    setMobileImage("");
    setMobileImageId("");
    setPrimaryButtonText("");
    setPrimaryButtonLink("");
    setSecondaryButtonText("");
    setSecondaryButtonLink("");
    setBgOverlayColor("rgba(0,0,0,0.4)");
    setBackgroundGradient("from-pink-500/10 via-background to-purple-500/10");
    setTextAlignment("center");
    setButtonStyle("solid");
    setAnimationType("fade");
    setTheme("light");
    setRating(4.9);
    setDeliveryInfo("Same Day Delivery");
    setTrustBadges([]);
    setFloatingCards([]);
    setPosition("home-hero");
    setDisplayOrder(banners.length);
    setStatus("active");
    setStartDate("");
    setEndDate("");
    setBadge("");
    setOfferLabel("");
    setCouponCode("");
    setActiveTab("content");
    setModalOpen(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setTitle(banner.title || "");
    setSubtitle(banner.subtitle || "");
    setDescription(banner.description || "");
    setDesktopImage(banner.desktopImage || "");
    setDesktopImageId(banner.desktopImageId || "");
    setTabletImage(banner.tabletImage || "");
    setTabletImageId(banner.tabletImageId || "");
    setMobileImage(banner.mobileImage || "");
    setMobileImageId(banner.mobileImageId || "");
    setPrimaryButtonText(banner.primaryButtonText || "");
    setPrimaryButtonLink(banner.primaryButtonLink || "");
    setSecondaryButtonText(banner.secondaryButtonText || "");
    setSecondaryButtonLink(banner.secondaryButtonLink || "");
    setBgOverlayColor(banner.bgOverlayColor || "rgba(0,0,0,0.4)");
    setBackgroundGradient(banner.backgroundGradient || "from-pink-500/10 via-background to-purple-500/10");
    setTextAlignment(banner.textAlignment || "center");
    setButtonStyle(banner.buttonStyle || "solid");
    setAnimationType(banner.animationType || "fade");
    setTheme(banner.theme || "light");
    setRating(banner.rating || 4.9);
    setDeliveryInfo(banner.deliveryInfo || "Same Day Delivery");
    setTrustBadges(banner.trustBadges || []);
    setFloatingCards(banner.floatingCards || []);
    setPosition(banner.position || "home-hero");
    setDisplayOrder(banner.displayOrder || 0);
    setStatus(banner.status || "active");
    setStartDate(banner.startDate ? banner.startDate.substring(0, 10) : "");
    setEndDate(banner.endDate ? banner.endDate.substring(0, 10) : "");
    setBadge(banner.badge || "");
    setOfferLabel(banner.offerLabel || "");
    setCouponCode(banner.couponCode || "");
    setActiveTab("content");
    setModalOpen(true);
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const res = await bannersApi.uploadImage(formData);
      const { url, publicId } = res.data.data;
      if (type === "desktop") {
        setDesktopImage(url);
        setDesktopImageId(publicId);
      } else if (type === "tablet") {
        setTabletImage(url);
        setTabletImageId(publicId);
      } else if (type === "mobile") {
        setMobileImage(url);
        setMobileImageId(publicId);
      }
      toast.success(`${type} image uploaded successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to upload ${type} image`);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleImageDelete = async (type, publicId) => {
    if (!publicId) return;
    try {
      await bannersApi.deleteImage(publicId);
      if (type === "desktop") {
        setDesktopImage("");
        setDesktopImageId("");
      } else if (type === "tablet") {
        setTabletImage("");
        setTabletImageId("");
      } else if (type === "mobile") {
        setMobileImage("");
        setMobileImageId("");
      }
      toast.success(`${type} image deleted`);
    } catch (err) {
      toast.error("Failed to delete image");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!desktopImage) {
      toast.error("Desktop image is required");
      setActiveTab("media");
      return;
    }

    const data = {
      title, subtitle, description,
      desktopImage, desktopImageId,
      tabletImage, tabletImageId,
      mobileImage, mobileImageId,
      primaryButtonText, primaryButtonLink,
      secondaryButtonText, secondaryButtonLink,
      bgOverlayColor, backgroundGradient, textAlignment, buttonStyle, animationType, theme,
      rating: Number(rating), deliveryInfo, trustBadges, floatingCards,
      position, displayOrder: Number(displayOrder), status,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      badge, offerLabel, couponCode
    };

    let res;
    if (editingBanner) {
      res = await dispatch(updateBanner({ id: editingBanner._id, data }));
    } else {
      res = await dispatch(createBanner(data));
    }

    if (res.meta.requestStatus === "fulfilled") {
      toast.success(editingBanner ? "Banner updated successfully" : "Banner created successfully");
      setModalOpen(false);
      dispatch(fetchAdminBanners());
    } else {
      toast.error(res.payload || "Operation failed");
    }
  };

  const handleDelete = async () => {
    const res = await dispatch(deleteBanner(deleteTarget._id));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Banner deleted successfully");
      setDeleteTarget(null);
      dispatch(fetchAdminBanners());
    } else {
      toast.error(res.payload || "Failed to delete banner");
    }
  };

  // HTML5 Drag and Drop sequence sorter
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (sourceIndex === targetIndex) return;

    const list = [...banners];
    const [moved] = list.splice(sourceIndex, 1);
    list.splice(targetIndex, 0, moved);

    // Optimistically trigger updates
    toast.info("Updating banner sequence...");
    try {
      await Promise.all(
        list.map((b, idx) => bannersApi.update(b._id, { displayOrder: idx }))
      );
      toast.success("Display sequence updated");
      dispatch(fetchAdminBanners());
    } catch (err) {
      toast.error("Failed to update sequence order");
    }
  };

  const moveOrder = async (banner, direction) => {
    const currentIndex = banners.findIndex(b => b._id === banner._id);
    if (currentIndex === -1) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const targetBanner = banners[targetIndex];

    try {
      await Promise.all([
        bannersApi.update(banner._id, { displayOrder: targetIndex }),
        bannersApi.update(targetBanner._id, { displayOrder: currentIndex })
      ]);
      toast.success("Display order updated");
      dispatch(fetchAdminBanners());
    } catch (err) {
      toast.error("Failed to swap order");
    }
  };

  const toggleStatus = async (banner) => {
    const newStatus = banner.status === "active" ? "inactive" : "active";
    try {
      await bannersApi.update(banner._id, { status: newStatus });
      toast.success(`Banner status updated to ${newStatus}`);
      dispatch(fetchAdminBanners());
    } catch (err) {
      toast.error("Failed to toggle banner status");
    }
  };

  const isExpired = (banner) => {
    if (!banner.endDate) return false;
    return new Date(banner.endDate) < new Date();
  };

  const isUpcoming = (banner) => {
    if (!banner.startDate) return false;
    return new Date(banner.startDate) > new Date();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Sparkles className="text-pink-600 h-6 w-6" /> Hero Banner Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">Design, schedule, and animately render landing hero promotions.</p>
        </div>
        <button onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold text-sm shadow-md shadow-pink-500/20 active:scale-95 transition-all">
          <Plus size={18} /> Create Banner
        </button>
      </div>

      {/* Filters & Searching */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search banners by title, subtitle, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm w-fit">
          <Filter className="h-4 w-4 text-slate-400" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-none bg-transparent focus:outline-none text-sm font-semibold text-slate-600 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Banners Drag-and-Drop List */}
      {banners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400 font-semibold shadow-sm flex flex-col items-center justify-center gap-3">
          <ImageIcon className="h-10 w-10 text-slate-300" />
          No banners found matching your parameters. Create one to get started.
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Drag handle to reorder display sequence</p>
          {banners.map((banner, index) => {
            const expired = isExpired(banner);
            const upcoming = isUpcoming(banner);
            
            return (
              <div 
                key={banner._id} 
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col lg:flex-row items-center justify-between gap-4 hover:shadow-md transition-shadow group relative"
              >
                {/* Drag handle */}
                <div className="hidden lg:flex items-center text-slate-300 cursor-grab active:cursor-grabbing p-2 hover:text-slate-500">
                  <Move size={20} />
                </div>

                {/* Banner Thumbnail */}
                <div className="w-full lg:w-44 aspect-[16/9] bg-slate-100 rounded-xl overflow-hidden relative shrink-0 border border-slate-100 shadow-inner">
                  <img src={getImageUrl(banner.desktopImage)} alt={banner.title} className="w-full h-full object-cover" />
                  
                  {/* Status Badge overlay */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                    {banner.status === "inactive" ? (
                      <span className="px-2 py-0.5 bg-slate-800/80 backdrop-blur-sm text-white text-[9px] font-black rounded uppercase tracking-wider">
                        Inactive
                      </span>
                    ) : expired ? (
                      <span className="px-2 py-0.5 bg-rose-600/80 backdrop-blur-sm text-white text-[9px] font-black rounded uppercase tracking-wider">
                        Expired
                      </span>
                    ) : upcoming ? (
                      <span className="px-2 py-0.5 bg-amber-500/80 backdrop-blur-sm text-white text-[9px] font-black rounded uppercase tracking-wider">
                        Scheduled
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-600/80 backdrop-blur-sm text-white text-[9px] font-black rounded uppercase tracking-wider">
                        Active Live
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-slate-800 text-lg leading-tight truncate">
                      {banner.title}
                    </h4>
                    {banner.badge && (
                      <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {banner.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 font-semibold truncate">{banner.subtitle || "No subtitle configured"}</p>
                  
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400 pt-1">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Layers size={13} /> Order: {banner.displayOrder}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Settings size={13} /> Animation: <span className="capitalize">{banner.animationType}</span>
                    </span>
                    {(banner.startDate || banner.endDate) && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar size={13} /> 
                        {banner.startDate ? banner.startDate.substring(0, 10) : "Open"} to {banner.endDate ? banner.endDate.substring(0, 10) : "Open"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Swap Order Buttons & Actions */}
                <div className="flex items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0">
                  {/* Manual Arrow Move (For touch devices/mobile) */}
                  <div className="flex gap-1">
                    <button 
                      onClick={() => moveOrder(banner, "up")}
                      disabled={index === 0}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button 
                      onClick={() => moveOrder(banner, "down")}
                      disabled={index === banners.length - 1}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>

                  <div className="h-6 w-[1px] bg-slate-200 hidden lg:block" />

                  {/* Toggle Status */}
                  <button 
                    onClick={() => toggleStatus(banner)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      banner.status === "active" 
                        ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700" 
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                  >
                    {banner.status === "active" ? "Enabled" : "Disabled"}
                  </button>

                  {/* Edit/Delete Buttons */}
                  <button onClick={() => openEditModal(banner)}
                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                    <Edit2 size={16} />
                  </button>
                  
                  <button onClick={() => setDeleteTarget(banner)}
                    className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">
                  {editingBanner ? "Edit Promotion Hero Banner" : "Create New Promotion Hero Banner"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Customize layouts, buttons, dates, and responsive view images.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex bg-slate-50 px-6 py-2 border-b border-slate-100 gap-2 shrink-0 overflow-x-auto hide-scrollbar">
              {[
                { id: "content", label: "Content" },
                { id: "media", label: "Media Assets" },
                { id: "styles", label: "Layout Styles" },
                { id: "highlights", label: "Floating Cards & Trust" },
                { id: "schedule", label: "Scheduler" }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={"px-4 py-2 text-xs font-bold rounded-lg transition-all " + (activeTab === tab.id ? "bg-white text-pink-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800")}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* Tab: Content */}
              {activeTab === "content" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-slate-600 mb-1.5 block uppercase tracking-wider">Promotion Title *</label>
                      <input required value={title} onChange={e => setTitle(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="e.g. Elegant Artisan Wedding Cakes" />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-600 mb-1.5 block uppercase tracking-wider">Alt Subtitle</label>
                      <input value={subtitle} onChange={e => setSubtitle(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="e.g. Crafted for Lifetime Memories" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-600 mb-1.5 block uppercase tracking-wider">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="e.g. Save 20% on our exclusive handcrafted collection designed by master bakers." />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-slate-600 mb-1.5 block uppercase tracking-wider">Customer Rating (Float)</label>
                      <input type="number" step="0.1" min="1" max="5" value={rating} onChange={e => setRating(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="e.g. 4.9" />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-600 mb-1.5 block uppercase tracking-wider">Delivery Information</label>
                      <input value={deliveryInfo} onChange={e => setDeliveryInfo(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="e.g. Same Day Delivery" />
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-100 my-2" />

                  {/* CTAs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      <span className="text-xs font-bold text-pink-600 uppercase tracking-widest block">Primary Action Button</span>
                      <div>
                        <input value={primaryButtonText} onChange={e => setPrimaryButtonText(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500" placeholder="Button Text (e.g. Order Now)" />
                      </div>
                      <div>
                        <input value={primaryButtonLink} onChange={e => setPrimaryButtonLink(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500" placeholder="Action URL (e.g. /shop)" />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Secondary Action Button</span>
                      <div>
                        <input value={secondaryButtonText} onChange={e => setSecondaryButtonText(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500" placeholder="Button Text (e.g. Contact Us)" />
                      </div>
                      <div>
                        <input value={secondaryButtonLink} onChange={e => setSecondaryButtonLink(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500" placeholder="Action URL" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Media Assets */}
              {activeTab === "media" && (
                <div className="space-y-4">
                  {/* Desktop Image upload */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Desktop Banner Image *</span>
                        <span className="text-[10px] text-slate-400">Recomended size: 1920x800 WebP</span>
                      </div>
                      {desktopImageId && (
                        <button type="button" onClick={() => handleImageDelete("desktop", desktopImageId)}
                          className="text-xs font-bold text-rose-600 flex items-center gap-1">
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>

                    {desktopImage ? (
                      <div className="aspect-[21/9] w-full rounded-xl overflow-hidden border border-slate-200 bg-white">
                        <img src={getImageUrl(desktopImage)} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-[21/9] border-2 border-dashed border-slate-200 hover:border-pink-500 rounded-xl cursor-pointer bg-white transition-colors">
                        {uploading.desktop ? <Loader2 className="animate-spin text-pink-600" /> : <Upload className="text-slate-400" />}
                        <span className="text-xs text-slate-500 font-bold mt-2">Click to upload Desktop Image</span>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "desktop")} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Tablet Image upload */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Tablet Banner Image</span>
                        <span className="text-[10px] text-slate-400">Recomended size: 1024x600</span>
                      </div>
                      {tabletImageId && (
                        <button type="button" onClick={() => handleImageDelete("tablet", tabletImageId)}
                          className="text-xs font-bold text-rose-600 flex items-center gap-1">
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>

                    {tabletImage ? (
                      <div className="aspect-[16/9] max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-white">
                        <img src={getImageUrl(tabletImage)} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-200 hover:border-pink-500 rounded-xl cursor-pointer bg-white transition-colors">
                        {uploading.tablet ? <Loader2 className="animate-spin text-pink-600" /> : <Upload className="text-slate-400" />}
                        <span className="text-xs text-slate-500 font-bold mt-1">Upload Tablet Image (Optional)</span>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "tablet")} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Mobile Image upload */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Mobile Banner Image</span>
                        <span className="text-[10px] text-slate-400">Recomended size: 600x800</span>
                      </div>
                      {mobileImageId && (
                        <button type="button" onClick={() => handleImageDelete("mobile", mobileImageId)}
                          className="text-xs font-bold text-rose-600 flex items-center gap-1">
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>

                    {mobileImage ? (
                      <div className="aspect-[3/4] h-32 rounded-xl overflow-hidden border border-slate-200 bg-white">
                        <img src={getImageUrl(mobileImage)} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-200 hover:border-pink-500 rounded-xl cursor-pointer bg-white transition-colors">
                        {uploading.mobile ? <Loader2 className="animate-spin text-pink-600" /> : <Upload className="text-slate-400" />}
                        <span className="text-xs text-slate-500 font-bold mt-1">Upload Mobile Image (Optional)</span>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "mobile")} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Layout Styles */}
              {activeTab === "styles" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-slate-600 mb-1.5 block uppercase tracking-wider">Text Alignment</label>
                      <select value={textAlignment} onChange={e => setTextAlignment(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none">
                        <option value="left">Left Aligned</option>
                        <option value="center">Centered</option>
                        <option value="right">Right Aligned</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-600 mb-1.5 block uppercase tracking-wider">Button Style</label>
                      <select value={buttonStyle} onChange={e => setButtonStyle(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none">
                        <option value="solid">Solid Colors (High Emphasised)</option>
                        <option value="outline">Border Outline</option>
                        <option value="glass">Glassmorphism Overlay</option>
                      </select>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='text-xs font-black text-slate-600 mb-1.5 block uppercase tracking-wider'>Overlay Background Color</label>
                      <input value={bgOverlayColor} onChange={e => setBgOverlayColor(e.target.value)}
                        className='w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none' placeholder='e.g. rgba(0, 0, 0, 0.4)' />
                    </div>
                    <div>
                      <label className='text-xs font-black text-slate-600 mb-1.5 block uppercase tracking-wider'>Slide Animation Style</label>
                      <select value={animationType} onChange={e => setAnimationType(e.target.value)}
                        className='w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none'>
                        <option value='fade'>Smooth Fade In</option>
                        <option value='zoom'>Immersive Scale Zoom</option>
                        <option value='slide'>Horizontal Slide Reveal</option>
                        <option value='parallax'>Parallax Layer Shift</option>
                      </select>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='text-xs font-black text-slate-600 mb-1.5 block uppercase tracking-wider'>Background Gradient Tailwind Classes</label>
                      <input value={backgroundGradient} onChange={e => setBackgroundGradient(e.target.value)}
                        className='w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none' placeholder='from-pink-500/10 via-background to-purple-500/10' />
                    </div>
                    <div>
                      <label className='text-xs font-black text-slate-600 mb-1.5 block uppercase tracking-wider'>UI Theme Mode</label>
                      <select value={theme} onChange={e => setTheme(e.target.value)}
                        className='w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none'>
                        <option value='light'>Light Minimalist</option>
                        <option value='dark'>Dark Luxury (Sleek Slate)</option>
                      </select>
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-100 my-2" />

                  {/* Promo labels */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-black text-slate-600 mb-1.5 block uppercase tracking-wider">Header Badge tag</label>
                      <input value={badge} onChange={e => setBadge(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none" placeholder="e.g. Masterpiece Collection" />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-600 mb-1.5 block uppercase tracking-wider">Floating Offer Label</label>
                      <input value={offerLabel} onChange={e => setOfferLabel(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none" placeholder="e.g. Save 20%" />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-600 mb-1.5 block uppercase tracking-wider">Coupon Code</label>
                      <input value={couponCode} onChange={e => setCouponCode(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none" placeholder="e.g. CAKE20" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "highlights" && (
                <div className="space-y-6">
                  {/* Floating Cards Section */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                    <h4 className="text-sm font-black text-pink-600 uppercase tracking-wider">Floating Highlights Cards</h4>
                    <p className="text-[11px] text-slate-400">These float elegantly around the cake image. Maximum 4 cards recommended.</p>
                    
                    {/* Add Card Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-white p-3.5 rounded-xl border border-slate-200">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">Highlight Text</label>
                        <input value={tempCardText} onChange={e => setTempCardText(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" placeholder="e.g. ⭐ 4.9 Rating" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">Lucide Icon name</label>
                        <select value={tempCardIcon} onChange={e => setTempCardIcon(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none">
                          <option value="Star">Star</option>
                          <option value="Truck">Truck</option>
                          <option value="Heart">Heart</option>
                          <option value="Flame">Flame</option>
                          <option value="ShieldCheck">ShieldCheck</option>
                          <option value="Cake">Cake</option>
                          <option value="Fresh">Sparkle</option>
                          <option value="Award">Award</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">Screen Position</label>
                        <select value={tempCardPos} onChange={e => setTempCardPos(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none">
                          <option value="top-left">Top Left</option>
                          <option value="top-right">Top Right</option>
                          <option value="bottom-left">Bottom Left</option>
                          <option value="bottom-right">Bottom Right</option>
                        </select>
                      </div>
                      <div className="sm:col-span-3 flex justify-end">
                        <button type="button" onClick={() => {
                          if (!tempCardText.trim()) return;
                          setFloatingCards([...floatingCards, { text: tempCardText, icon: tempCardIcon, position: tempCardPos }]);
                          setTempCardText("");
                        }}
                          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold text-xs">
                          Add Floating Card
                        </button>
                      </div>
                    </div>

                    {/* Cards List */}
                    <div className="space-y-2">
                      {floatingCards.map((c, i) => (
                        <div key={i} className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{c.text}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono uppercase">{c.position}</span>
                          </div>
                          <button type="button" onClick={() => setFloatingCards(floatingCards.filter((_, idx) => idx !== i))}
                            className="text-red-500 font-bold hover:underline">
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trust Badges Section */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                    <h4 className="text-sm font-black text-slate-600 uppercase tracking-wider">Trust Grid Badges</h4>
                    <p className="text-[11px] text-slate-400">Features shown directly below the Hero block. Maximum 4 badges recommended.</p>

                    {/* Add Badge Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-white p-3.5 rounded-xl border border-slate-200">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">Badge Title</label>
                        <input value={tempBadgeLabel} onChange={e => setTempBadgeLabel(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" placeholder="e.g. 100% Fresh" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">Description</label>
                        <input value={tempBadgeDesc} onChange={e => setTempBadgeDesc(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" placeholder="Baked daily by pastry artists" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase"> Lucide Icon</label>
                        <select value={tempBadgeIcon} onChange={e => setTempBadgeIcon(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none">
                          <option value="Fresh">Sparkle</option>
                          <option value="Truck">Truck</option>
                          <option value="ShieldCheck">ShieldCheck</option>
                          <option value="Cake">Cake</option>
                          <option value="Award">Award</option>
                          <option value="Star">Star</option>
                          <option value="Heart">Heart</option>
                          <option value="Flame">Flame</option>
                        </select>
                      </div>
                      <div className="sm:col-span-3 flex justify-end">
                        <button type="button" onClick={() => {
                          if (!tempBadgeLabel.trim()) return;
                          setTrustBadges([...trustBadges, { label: tempBadgeLabel, description: tempBadgeDesc, icon: tempBadgeIcon }]);
                          setTempBadgeLabel("");
                          setTempBadgeDesc("");
                        }}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-bold text-xs">
                          Add Trust Badge
                        </button>
                      </div>
                    </div>

                    {/* Badges List */}
                    <div className="space-y-2">
                      {trustBadges.map((b, i) => (
                        <div key={i} className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs">
                          <div>
                            <span className="font-extrabold text-slate-800 block">{b.label}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{b.description || "No description"}</span>
                          </div>
                          <button type="button" onClick={() => setTrustBadges(trustBadges.filter((_, idx) => idx !== i))}
                            className="text-red-500 font-bold hover:underline">
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Scheduler */}
              {activeTab === "schedule" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-slate-600 mb-1.5 block uppercase tracking-wider">Start Schedule Date</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-600 mb-1.5 block uppercase tracking-wider">End Expiration Date</label>
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-slate-600 mb-1.5 block uppercase tracking-wider">Display Location Position</label>
                      <select value={position} onChange={e => setPosition(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none">
                        <option value="home-hero">Home Top Hero Banner</option>
                        <option value="home-banner">Home Middle Promotional Section</option>
                        <option value="shop-top">Shop Catalog Page Top</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-600 mb-1.5 block uppercase tracking-wider">Sequence displayOrder</label>
                      <input type="number" min="0" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-slate-700 block">Enable Banner Immediately</span>
                      <span className="text-[11px] text-slate-400">If disabled, it will never render even if active within schedules.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStatus(prev => prev === "active" ? "inactive" : "active")}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        status === "active" ? "bg-pink-600" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          status === "active" ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

            </form>

            {/* Modal Footer Actions */}
            <div className="p-6 border-t border-slate-100 flex gap-3 shrink-0">
              <button type="button" onClick={() => setModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 active:scale-95 transition-all">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white font-bold text-sm rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : null}
                {editingBanner ? "Update Banner" : "Create Banner"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Promotion Banner?"
        message="This promo banner will be removed from all layouts and any associated uploaded media files will be deleted from storage immediately."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
