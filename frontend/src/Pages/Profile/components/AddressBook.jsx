import { useState } from "react";
import { useDispatch } from "react-redux";
import { 
  addAddress, 
  deleteAddress, 
  updateAddress, 
  setDefaultAddress 
} from "@/features/auth/authSlice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Home, 
  Briefcase, 
  Compass, 
  Smartphone,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AddressBook({ user }) {
  const dispatch = useDispatch();

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    mobileNumber: "",
    alternateMobile: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    addressType: "Home",
    isDefault: false
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      fullName: user.name || "",
      mobileNumber: user.mobileNumber || "",
      alternateMobile: "",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
      addressType: "Home",
      isDefault: false
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingId(addr._id);
    setForm({
      fullName: addr.fullName || "",
      mobileNumber: addr.mobileNumber || "",
      alternateMobile: addr.alternateMobile || "",
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "",
      country: addr.country || "India",
      pincode: addr.pincode || "",
      addressType: addr.addressType || "Home",
      isDefault: addr.isDefault || false
    });
    setFormOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.mobileNumber || !form.addressLine1 || !form.city || !form.state || !form.pincode) {
      return toast.error("Please fill in all required address fields.");
    }

    try {
      if (editingId) {
        // Update existing address
        const res = await dispatch(updateAddress({ id: editingId, data: form }));
        if (res.meta.requestStatus === "fulfilled") {
          toast.success("Address updated successfully!");
          setFormOpen(false);
        } else {
          toast.error(res.payload || "Failed to update address.");
        }
      } else {
        // Create new address
        const res = await dispatch(addAddress(form));
        if (res.meta.requestStatus === "fulfilled") {
          toast.success("New address added successfully!");
          setFormOpen(false);
        } else {
          toast.error(res.payload || "Failed to create address.");
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    }
  };

  const handleDelete = async (addrId) => {
    try {
      const res = await dispatch(deleteAddress(addrId));
      if (res.meta.requestStatus === "fulfilled") {
        toast.info("Address deleted successfully.");
      } else {
        toast.error(res.payload || "Failed to delete address.");
      }
    } catch (err) {
      toast.error("Failed to delete address.");
    }
  };

  const handleSetDefault = async (addrId) => {
    try {
      const res = await dispatch(setDefaultAddress(addrId));
      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Default address updated.");
      } else {
        toast.error(res.payload || "Failed to set default address.");
      }
    } catch (err) {
      toast.error("Failed to update default address.");
    }
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case "Home": return <Home className="h-4 w-4" />;
      case "Office": return <Briefcase className="h-4 w-4" />;
      default: return <Compass className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border border-border shadow-sm rounded-3xl text-left bg-card">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <MapPin className="h-5.5 w-5.5 text-primary" /> Address Book
          </CardTitle>
          <CardDescription>Configure your delivery shipping destinations for quick bakery checkout.</CardDescription>
        </div>
        {!formOpen && (
          <Button onClick={handleOpenAdd} size="sm" className="bg-primary hover:bg-primary/95 text-xs font-bold rounded-xl h-9 gap-1">
            <Plus className="h-4 w-4" /> Add New
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Toggleable form card */}
        <AnimatePresence mode="wait">
          {formOpen && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit} 
              className="bg-secondary/20 border border-border p-5 rounded-2xl space-y-4 text-xs"
            >
              <h4 className="font-extrabold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                {editingId ? "Edit Address Details" : "Add New Delivery Address"}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Full Name *</Label>
                  <Input name="fullName" value={form.fullName} onChange={handleChange} required className="bg-card border-border h-10 text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Mobile Number *</Label>
                  <Input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} required className="bg-card border-border h-10 text-xs rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Alternate Phone</Label>
                  <Input name="alternateMobile" value={form.alternateMobile} onChange={handleChange} className="bg-card border-border h-10 text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Address Type</Label>
                  <select
                    name="addressType"
                    value={form.addressType}
                    onChange={handleChange}
                    className="flex w-full rounded-xl border border-border bg-card px-3 py-2 text-xs h-10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground font-semibold"
                  >
                    <option value="Home">Home (All Day Delivery)</option>
                    <option value="Office">Office (9 AM - 6 PM)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Address Line 1 *</Label>
                  <Input name="addressLine1" value={form.addressLine1} onChange={handleChange} required placeholder="Street address, P.O. box, company name" className="bg-card border-border h-10 text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Address Line 2</Label>
                  <Input name="addressLine2" value={form.addressLine2} onChange={handleChange} placeholder="Apartment, suite, unit, building, floor" className="bg-card border-border h-10 text-xs rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Landmark</Label>
                  <Input name="landmark" value={form.landmark} onChange={handleChange} placeholder="e.g. Near park" className="bg-card border-border h-10 text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">City *</Label>
                  <Input name="city" value={form.city} onChange={handleChange} required className="bg-card border-border h-10 text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">State *</Label>
                  <Input name="state" value={form.state} onChange={handleChange} required className="bg-card border-border h-10 text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Pincode *</Label>
                  <Input name="pincode" value={form.pincode} onChange={handleChange} required className="bg-card border-border h-10 text-xs rounded-xl" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={form.isDefault}
                  onChange={handleChange}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <Label htmlFor="isDefault" className="text-xs font-semibold text-foreground cursor-pointer select-none">
                  Set as default shipping address
                </Label>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-border/60 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setFormOpen(false)}
                  className="rounded-xl text-xs font-bold border-border h-9"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/95 rounded-xl font-bold h-9 px-6"
                >
                  {editingId ? "Save Changes" : "Add Address"}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Address cards list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {user.addresses && user.addresses.length > 0 ? (
            user.addresses.map((addr) => (
              <motion.div 
                key={addr._id} 
                layout
                className={`border p-5 rounded-2xl relative flex flex-col justify-between hover:border-primary/40 transition-colors bg-card ${
                  addr.isDefault ? "border-primary/60 ring-1 ring-primary/20 bg-secondary/5" : "border-border"
                }`}
              >
                {/* Header indicators */}
                <div className="flex items-center justify-between pb-3 text-left">
                  <Badge className="bg-primary/20 text-primary border border-primary/30 text-[10px] font-black py-0 px-2 flex items-center gap-1">
                    {getAddressIcon(addr.addressType)}
                    {addr.addressType}
                  </Badge>
                  {addr.isDefault && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black py-0.5 px-2 flex items-center gap-0.5 pointer-events-none uppercase">
                      <Check className="h-3 w-3" /> Default
                    </Badge>
                  )}
                </div>

                {/* Details layout */}
                <div className="text-left text-xs pr-6 space-y-1.5 py-1">
                  <p className="font-extrabold text-foreground text-sm">{addr.fullName}</p>
                  <p className="text-muted-foreground leading-normal font-medium">
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                    {addr.landmark ? ` (Landmark: ${addr.landmark})` : ""}
                    <br />
                    {addr.city}, {addr.state} {addr.pincode}
                  </p>
                  <p className="text-muted-foreground font-semibold flex items-center gap-1 pt-1.5 text-[10px]">
                    <Smartphone className="h-3.5 w-3.5 text-primary" /> {addr.mobileNumber}
                    {addr.alternateMobile ? ` / ${addr.alternateMobile}` : ""}
                  </p>
                </div>

                {/* Control actions */}
                <div className="flex justify-between items-center mt-5 pt-3 border-t border-border/60">
                  <div className="flex gap-1.5">
                    <Button 
                      onClick={() => handleOpenEdit(addr)} 
                      size="sm" 
                      variant="ghost"
                      className="text-muted-foreground hover:text-primary rounded-xl h-8 px-2 text-xs"
                      title="Edit Address"
                    >
                      <Edit3 className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button 
                      onClick={() => handleDelete(addr._id)} 
                      size="sm" 
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive rounded-xl h-8 px-2 text-xs"
                      title="Delete Address"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                  {!addr.isDefault && (
                    <Button
                      onClick={() => handleSetDefault(addr._id)}
                      size="sm"
                      variant="outline"
                      className="rounded-xl text-[10px] font-bold border-border h-8"
                    >
                      Set Default
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8 col-span-2">
              No delivery addresses saved in your address book. Add one to get started!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
