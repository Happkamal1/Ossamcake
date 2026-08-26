import { useState, useEffect, useRef } from "react";
import { getImageUrl } from "@/lib/api";
import { useDispatch } from "react-redux";
import { updateProfile, uploadAvatar } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User as UserIcon, 
  Camera, 
  Trash2, 
  RefreshCw,
  Mail,
  Calendar,
  Phone,
  Shield,
  Sparkles,
  Info
} from "lucide-react";
import { toast } from "sonner";

export default function MyProfile({ user }) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "Prefer not to say",
    dateOfBirth: "",
    bio: "",
  });

  const [isModified, setIsModified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.mobileNumber || "",
        gender: user.gender || "Prefer not to say",
        dateOfBirth: user.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    // Check if modified compared to user profile
    const originalBirthdate = user.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : "";
    const nameChanged = (user.name || "") !== (updatedForm.name || "");
    const phoneChanged = (user.mobileNumber || "") !== (updatedForm.phone || "");
    const genderChanged = (user.gender || "Prefer not to say") !== (updatedForm.gender || "Prefer not to say");
    const dobChanged = originalBirthdate !== (updatedForm.dateOfBirth || "");
    const bioChanged = (user.bio || "") !== (updatedForm.bio || "");

    setIsModified(nameChanged || phoneChanged || genderChanged || dobChanged || bioChanged);
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File size exceeds 5MB limit.");
    }

    // Validate image format
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return toast.error("Only JPG, JPEG, PNG, and WebP images are allowed.");
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setPhotoLoading(true);
    try {
      const res = await dispatch(uploadAvatar(formData));
      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Profile photo uploaded successfully!");
      } else {
        toast.error(res.payload || "Failed to upload profile photo.");
      }
    } catch (err) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoLoading(true);
    try {
      const res = await dispatch(updateProfile({ profileImage: "" }));
      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Profile photo removed.");
      } else {
        toast.error(res.payload || "Failed to remove profile photo.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      return toast.error("Full Name cannot be empty.");
    }

    setSaving(true);
    try {
      const res = await dispatch(updateProfile({
        name: form.name,
        phone: form.phone,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        bio: form.bio,
      }));

      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Profile updated successfully!");
        setIsModified(false);
      } else {
        toast.error(res.payload || "Failed to save profile changes.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handlePhotoUpload(files[0]);
    }
  };

  // Profile avatar formatting
  const avatarUrl = user.profileImage
    ? getImageUrl(user.profileImage)
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Left side card - Avatar upload and Read-only details */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="border border-border shadow-sm rounded-3xl bg-card text-center overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 w-full" />
          <CardContent className="pt-0 pb-6 relative flex flex-col items-center">
            
            {/* Avatar Drop Zone */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`h-24 w-24 rounded-full -mt-12 bg-background border-2 shadow-lg flex items-center justify-center relative overflow-hidden transition-all group ${
                dragOver ? "border-primary scale-105" : "border-border"
              }`}
            >
              {photoLoading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                  <RefreshCw className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={user.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-pink-500 to-purple-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-inner">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
              )}
              
              {/* Camera Hover Overlay */}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity focus:outline-none"
                title="Change photo"
              >
                <Camera className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Hidden Input file selector */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
            />

            <div className="mt-4 space-y-1">
              <h3 className="font-extrabold text-foreground text-lg flex items-center justify-center gap-1.5">
                {user.name || "Customer"} 
                {user.role === "admin" && (
                  <Badge className="bg-primary/20 text-primary border border-primary/30 text-[10px] py-0 px-1.5 uppercase font-bold">Admin</Badge>
                )}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">{user.email}</p>
            </div>

            {/* Image control buttons */}
            <div className="flex gap-2.5 mt-5">
              <Button 
                type="button" 
                size="sm"
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl text-xs font-bold border-border h-9"
              >
                Replace
              </Button>
              {avatarUrl && (
                <Button 
                  type="button" 
                  size="sm"
                  variant="ghost" 
                  onClick={handleRemovePhoto}
                  className="rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive h-9"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Remove
                </Button>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground mt-4 font-medium px-4 leading-normal">
              Drag & drop images here. Max size 5MB. Supports JPG, JPEG, PNG, or WebP.
            </p>
          </CardContent>
        </Card>

        {/* Read-Only Account Details Card */}
        <Card className="border border-border shadow-sm rounded-3xl bg-card text-left">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
              <Info className="h-4 w-4 text-primary" /> Account Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div className="flex justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground font-semibold">User ID</span>
              <span className="font-bold text-foreground font-mono">{user._id}</span>
            </div>
            <div className="flex justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground font-semibold">Login Provider</span>
              <span className="font-bold text-foreground capitalize flex items-center gap-1">
                {user.provider || "Local Password"}
              </span>
            </div>
            <div className="flex justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground font-semibold">Account Status</span>
              <Badge className="bg-emerald-500/10 text-emerald-500 font-bold border-emerald-500/20 capitalize h-5 py-0 px-2 text-[10px] pointer-events-none">
                {user.accountStatus || "active"}
              </Badge>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-muted-foreground font-semibold">Member Since</span>
              <span className="font-bold text-foreground">
                {new Date(user.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right side card - Form fields editing */}
      <div className="lg:col-span-2">
        <Card className="border border-border shadow-sm rounded-3xl bg-card text-left">
          <CardHeader>
            <CardTitle className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <UserIcon className="h-5.5 w-5.5 text-primary" /> Profile Details
            </CardTitle>
            <CardDescription>Update your personal information to customize your bakery ordering experience.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="profile-name" className="text-xs font-extrabold text-foreground">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="profile-name" 
                      name="name" 
                      value={form.name} 
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="bg-secondary border-border pl-10 rounded-xl text-xs h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-phone" className="text-xs font-extrabold text-foreground">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="profile-phone" 
                      name="phone" 
                      value={form.phone} 
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="bg-secondary border-border pl-10 rounded-xl text-xs h-11"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="profile-dob" className="text-xs font-extrabold text-foreground">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input 
                      id="profile-dob" 
                      name="dateOfBirth" 
                      type="date"
                      value={form.dateOfBirth} 
                      onChange={handleChange}
                      className="bg-secondary border-border pl-10 rounded-xl text-xs h-11 text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-gender" className="text-xs font-extrabold text-foreground">Gender</Label>
                  <select
                    id="profile-gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="flex w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs h-11 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground font-medium"
                  >
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-bio" className="text-xs font-extrabold text-foreground">Bio</Label>
                <textarea 
                  id="profile-bio" 
                  name="bio" 
                  rows={4} 
                  value={form.bio} 
                  onChange={handleChange}
                  className="flex w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground resize-none" 
                  placeholder="Tell us about yourself (e.g. chocolate enthusiast, red velvet fan...)"
                />
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={!isModified || saving}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl h-11 px-8 transition-all shadow-md"
                >
                  {saving ? "Saving Changes..." : "Save Profile Details"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
