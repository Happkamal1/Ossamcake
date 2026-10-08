import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminSiteSettings,
  updateAdminSiteSettings,
} from "@/features/admin/adminSlice";
import { fetchPublicSettings } from "@/features/siteSettings/siteSettingsSlice";
import {
  Settings,
  Store,
  Phone,
  Share2,
  Truck,
  Megaphone,
  Save,
  RefreshCw,
  Info,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSiteSettings() {
  const dispatch = useDispatch();
  const { siteSettings, loading } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    businessName: "OssamCake",
    tagline: "Crafting Luxury Celebrations with Sweet Elegance",
    phone: "+1 (555) 123-4567",
    email: "hello@ossamcake.com",
    address: "123 Baker Street, Manhattan, New York, NY 10001",
    workingHours: "Mon - Sun: 8:00 AM - 10:00 PM",
    socialLinks: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      twitter: "https://twitter.com",
      pinterest: "",
    },
    footer: {
      aboutText: "Crafting premium luxury celebrations with sweet elegance since 2010. Every cake is hand-finished by master pastry artists.",
      copyrightText: "OssamCake. All rights reserved.",
    },
    shipping: {
      freeShippingThreshold: 800,
      shippingFee: 99,
      taxRate: 5, // stored as percentage in form, sent as % or decimal
      currencySymbol: "₹",
      currencyCode: "INR",
    },
    announcement: {
      enabled: true,
      text: "Free delivery on orders over ₹800! Use code WELCOME10 for 10% off",
      link: "/offers",
    },
  });

  const loadSettings = async () => {
    try {
      const res = await dispatch(fetchAdminSiteSettings()).unwrap();
      if (res) {
        setForm({
          businessName: res.businessName || "OssamCake",
          tagline: res.tagline || "",
          phone: res.phone || "",
          email: res.email || "",
          address: res.address || "",
          workingHours: res.workingHours || "",
          socialLinks: {
            facebook: res.socialLinks?.facebook || "",
            instagram: res.socialLinks?.instagram || "",
            youtube: res.socialLinks?.youtube || "",
            twitter: res.socialLinks?.twitter || "",
            pinterest: res.socialLinks?.pinterest || "",
          },
          footer: {
            aboutText: res.footer?.aboutText || "",
            copyrightText: res.footer?.copyrightText || "",
          },
          shipping: {
            freeShippingThreshold: res.shipping?.freeShippingThreshold ?? 800,
            shippingFee: res.shipping?.shippingFee ?? 99,
            taxRate: (res.shipping?.taxRate ?? 0.05) <= 1 ? (res.shipping?.taxRate ?? 0.05) * 100 : res.shipping?.taxRate,
            currencySymbol: res.shipping?.currencySymbol || "₹",
            currencyCode: res.shipping?.currencyCode || "INR",
          },
          announcement: {
            enabled: res.announcement?.enabled ?? true,
            text: res.announcement?.text || "",
            link: res.announcement?.link || "/offers",
          },
        });
      }
    } catch (err) {
      toast.error(err || "Failed to load site settings");
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        shipping: {
          ...form.shipping,
          freeShippingThreshold: Number(form.shipping.freeShippingThreshold) || 800,
          shippingFee: Number(form.shipping.shippingFee) || 99,
          taxRate: (Number(form.shipping.taxRate) || 5) / 100,
        },
      };

      await dispatch(updateAdminSiteSettings(payload)).unwrap();
      await dispatch(fetchPublicSettings()); // Refresh global public store
      toast.success("Site settings updated and synced successfully!");
    } catch (err) {
      toast.error(err || "Failed to save site settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General & Branding", icon: Store },
    { id: "contact", label: "Contact & Hours", icon: Phone },
    { id: "social", label: "Social Media", icon: Share2 },
    { id: "shipping", label: "Shipping & Delivery Fee", icon: Truck },
    { id: "announcement", label: "Announcement Bar", icon: Megaphone },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Site & Business Settings</h1>
            <p className="text-xs text-slate-500 font-medium">Configure global business information, shipping thresholds, footer, and announcements</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSettings}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save All Settings"}
          </button>
        </div>
      </div>

      {/* Main Settings Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 p-4 space-y-1 shrink-0 bg-slate-50/50">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === id
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </button>
          ))}

          <div className="pt-6 px-3">
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Info className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                Backend Authority
              </div>
              <p className="text-blue-700/80 leading-relaxed">
                Changes saved here dynamically propagate to customer checkout calculations and public site components.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 md:p-8">
          <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
            {/* 1. General Tab */}
            {activeTab === "general" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Store className="h-4.5 w-4.5 text-blue-600" />
                  General Business & Branding
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Brand Tagline
                  </label>
                  <input
                    type="text"
                    value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Footer About Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.footer.aboutText}
                    onChange={(e) => setForm({ ...form, footer: { ...form.footer, aboutText: e.target.value } })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Footer Copyright Notice
                  </label>
                  <input
                    type="text"
                    value={form.footer.copyrightText}
                    onChange={(e) => setForm({ ...form, footer: { ...form.footer, copyrightText: e.target.value } })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* 2. Contact Tab */}
            {activeTab === "contact" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Phone className="h-4.5 w-4.5 text-blue-600" />
                  Contact Information & Working Hours
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Customer Support Phone
                    </label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Store / Bakery Address
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Working Hours
                  </label>
                  <input
                    type="text"
                    value={form.workingHours}
                    onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* 3. Social Tab */}
            {activeTab === "social" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Share2 className="h-4.5 w-4.5 text-blue-600" />
                  Social Media Channels
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={form.socialLinks.instagram}
                    onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, instagram: e.target.value } })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/..."
                    value={form.socialLinks.facebook}
                    onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, facebook: e.target.value } })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={form.socialLinks.youtube}
                    onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, youtube: e.target.value } })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    X (Twitter) URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://twitter.com/..."
                    value={form.socialLinks.twitter}
                    onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, twitter: e.target.value } })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* 4. Shipping & Pricing Tab */}
            {activeTab === "shipping" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Truck className="h-4.5 w-4.5 text-blue-600" />
                  Delivery & Shipping Fee Engine
                </h3>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1">
                  <p className="font-bold">Authoritative Cart Calculations</p>
                  <p>
                    These parameters directly control order delivery fees and minimum free shipping threshold calculation across the backend checkout pipeline.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Free Shipping Threshold (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={form.shipping.freeShippingThreshold}
                      onChange={(e) => setForm({
                        ...form,
                        shipping: { ...form.shipping, freeShippingThreshold: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-900"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Orders at or above this amount receive FREE delivery (Default: ₹800)</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Standard Shipping Fee (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={form.shipping.shippingFee}
                      onChange={(e) => setForm({
                        ...form,
                        shipping: { ...form.shipping, shippingFee: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-900"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Flat shipping fee for orders below threshold (Default: ₹99)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      GST / Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={form.shipping.taxRate}
                      onChange={(e) => setForm({
                        ...form,
                        shipping: { ...form.shipping, taxRate: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-900"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Applied to cart subtotal (Default: 5%)</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Currency Symbol
                    </label>
                    <input
                      type="text"
                      value={form.shipping.currencySymbol}
                      onChange={(e) => setForm({
                        ...form,
                        shipping: { ...form.shipping, currencySymbol: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. Announcement Tab */}
            {activeTab === "announcement" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Megaphone className="h-4.5 w-4.5 text-blue-600" />
                  Top Header Announcement Bar
                </h3>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="announcementActive"
                    checked={form.announcement.enabled}
                    onChange={(e) => setForm({
                      ...form,
                      announcement: { ...form.announcement, enabled: e.target.checked }
                    })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="announcementActive" className="text-xs font-bold text-slate-800 select-none">
                    Display Announcement Bar on Top Header
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Announcement Text
                  </label>
                  <input
                    type="text"
                    value={form.announcement.text}
                    onChange={(e) => setForm({
                      ...form,
                      announcement: { ...form.announcement, text: e.target.value }
                    })}
                    placeholder="e.g. Free delivery on orders over ₹800! Use code WELCOME10"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Click Link (optional)
                  </label>
                  <input
                    type="text"
                    value={form.announcement.link}
                    onChange={(e) => setForm({
                      ...form,
                      announcement: { ...form.announcement, link: e.target.value }
                    })}
                    placeholder="/offers or /shop"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving Changes..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
