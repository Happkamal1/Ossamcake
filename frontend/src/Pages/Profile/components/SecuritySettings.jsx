import { useState } from "react";
import { useDispatch } from "react-redux";
import { updatePassword, toggle2FA, resendOtp } from "@/features/auth/authSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  KeyRound,
  ShieldCheck,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import VerificationModal from "./VerificationModal";

export default function SecuritySettings({ user }) {
  const dispatch = useDispatch();

  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [savingPassword, setSavingPassword] = useState(false);
  const [toggling2FA, setToggling2FA] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      return toast.error("Please fill in all password fields.");
    }
    if (passwords.newPass.length < 6) {
      return toast.error("New password must be at least 6 characters.");
    }
    if (passwords.newPass !== passwords.confirm) {
      return toast.error("New passwords do not match.");
    }

    setSavingPassword(true);
    try {
      const res = await dispatch(updatePassword({
        currentPassword: passwords.current,
        newPassword: passwords.newPass
      }));

      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Password updated successfully!");
        setPasswords({ current: "", newPass: "", confirm: "" });
      } else {
        toast.error(res.payload || "Failed to update password. Verify current password.");
      }
    } catch (err) {
      toast.error("Password modification failed.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleToggle2FA = async () => {
    if (user.is2FAEnabled) {
      // Disable directly or with confirmation
      if (confirm("Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.")) {
        setToggling2FA(true);
        try {
          const res = await dispatch(toggle2FA({ enable: false }));
          if (res.meta.requestStatus === "fulfilled") {
            toast.success("Two-Factor Authentication has been disabled.");
          } else {
            toast.error(res.payload || "Failed to disable 2FA.");
          }
        } catch (err) {
          toast.error("An error occurred.");
        } finally {
          setToggling2FA(false);
        }
      }
    } else {
      // Enable: trigger OTP first, then open verification modal
      setToggling2FA(true);
      try {
        const res = await dispatch(resendOtp({ email: user.email, type: "login2FA" }));
        if (res.meta.requestStatus === "fulfilled") {
          toast.info("A verification code has been sent to your email.");
          setOtpModalOpen(true);
        } else {
          toast.error(res.payload || "Failed to send 2FA verification email.");
        }
      } catch (err) {
        toast.error("Error triggering 2FA setup.");
      } finally {
        setToggling2FA(false);
      }
    }
  };

  const handle2FAVerified = async () => {
    // Enable 2FA after code is verified
    try {
      const res = await dispatch(toggle2FA({ enable: true }));
      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Two-Factor Authentication has been enabled successfully!");
      } else {
        toast.error(res.payload || "Failed to update 2FA status.");
      }
    } catch (err) {
      toast.error("Failed to enable 2FA.");
    }
  };

  const googleConnected = user.provider === "google" || !!user.googleId;

  return (
    <div className="space-y-6">
      {/* SECURITY SCORE & STATUS */}
      <Card className="border border-border shadow-sm rounded-3xl bg-card text-left">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-extrabold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Account Security Status
          </CardTitle>
          <CardDescription>Review the safety markers linked to your profile credentials.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold">

          {/* Email verification status */}
          <div className="border border-border p-4 rounded-2xl flex flex-col justify-between hover:border-primary/20 transition-colors bg-secondary/5">
            <div className="flex justify-between items-center pb-2">
              <span className="text-muted-foreground">Email Identity</span>
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-extrabold text-foreground text-sm truncate">{user.email}</p>
              <Badge className={`mt-2 font-black text-[9px] uppercase border px-1.5 h-5 pointer-events-none ${user.isEmailVerified
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-destructive/10 text-destructive border-destructive/20"
                }`}>
                {user.isEmailVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </div>

          {/* Google Connected Status */}
          <div className="border border-border p-4 rounded-2xl flex flex-col justify-between hover:border-primary/20 transition-colors bg-secondary/5">
            <div className="flex justify-between items-center pb-2">
              <span className="text-muted-foreground">Google Integration</span>
              <span className="text-[10px] text-primary font-bold">Social Link</span>
            </div>
            <div>
              <p className="font-extrabold text-foreground text-sm">Google Connection</p>
              <Badge className={`mt-2 font-black text-[9px] uppercase border px-1.5 h-5 pointer-events-none ${googleConnected
                  ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  : "bg-secondary text-muted-foreground border-border"
                }`}>
                {googleConnected ? "Connected" : "Not Linked"}
              </Badge>
            </div>
          </div>

          {/* 2FA Status */}
          <div
            onClick={toggling2FA ? undefined : handleToggle2FA}
            className={`border border-border p-4 rounded-2xl flex flex-col justify-between hover:border-primary/20 transition-colors bg-secondary/5 cursor-pointer ${toggling2FA ? 'opacity-70 pointer-events-none' : ''}`}
          >
            <div className="flex justify-between items-center pb-2">
              <span className="text-muted-foreground">Two-Factor Auth</span>
              <KeyRound className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-extrabold text-foreground text-sm">Login Protection</p>
              <Badge className={`mt-2 font-black text-[9px] uppercase border px-1.5 h-5 pointer-events-none ${user.is2FAEnabled
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                }`}>
                {user.is2FAEnabled ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* TWO-FACTOR TOGGLING PANEL */}
      <Card className="border border-border shadow-sm rounded-3xl bg-card text-left">
        <CardHeader>
          <CardTitle className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <KeyRound className="h-5.5 w-5.5 text-primary" /> Two-Factor Authentication (2FA)
          </CardTitle>
          <CardDescription>Toggle Two-Factor authentication to prevent unauthorized account access.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-secondary/20 border border-border rounded-2xl gap-4">
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-foreground">
                Email Two-Factor OTP Codes
              </h4>
              <p className="text-xs text-muted-foreground leading-normal">
                Whenever you log in, we will send a 6-digit OTP verification code to your email.
              </p>
            </div>
            <Button
              onClick={handleToggle2FA}
              disabled={toggling2FA}
              variant={user.is2FAEnabled ? "destructive" : "default"}
              className="rounded-xl font-bold h-11 px-6 transition-all shadow-md flex-shrink-0"
            >
              {user.is2FAEnabled ? "Disable Protection" : "Enable OTP 2FA"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PASSWORD CHANGE PANEL (HIDDEN FOR GOOGLE-ONLY ACCOUNTS) */}
      {(!googleConnected || user.password || user.provider === "local") && (
        <Card className="border border-border shadow-sm rounded-3xl bg-card text-left">
          <CardHeader>
            <CardTitle className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Lock className="h-5.5 w-5.5 text-primary" /> Change Password
            </CardTitle>
            <CardDescription>Update your local password credentials periodically to keep your account safe.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">

              <div className="space-y-2">
                <Label htmlFor="current-pw" className="text-xs font-extrabold text-foreground">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-pw"
                    type={showCurrent ? "text" : "password"}
                    required
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="bg-secondary border-border rounded-xl text-xs h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-pw" className="text-xs font-extrabold text-foreground">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-pw"
                    type={showNew ? "text" : "password"}
                    required
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    className="bg-secondary border-border rounded-xl text-xs h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-pw" className="text-xs font-extrabold text-foreground">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-pw"
                    type={showConfirm ? "text" : "password"}
                    required
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="bg-secondary border-border rounded-xl text-xs h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={savingPassword}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl h-11 px-6 shadow-md transition-all"
                >
                  {savingPassword ? "Updating Password..." : "Update Password"}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      )}

      {/* Warning banner for social-only accounts */}
      {googleConnected && !user.password && user.provider === "google" && (
        <Card className="border border-amber-500/30 bg-amber-500/5 shadow-sm rounded-3xl text-left">
          <CardContent className="p-5 flex gap-3.5 items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-amber-800 dark:text-amber-300 font-medium leading-normal">
              <h4 className="font-extrabold text-sm text-amber-900 dark:text-amber-200">Google Authentication Active</h4>
              <p>Your account is managed securely via Google SSO. Password change actions are disabled since credentials reside with Google. To enable passwords, link a password to your email by contacting customer support.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* OTP verification dialog */}
      <VerificationModal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        email={user.email}
        onVerified={handle2FAVerified}
      />
    </div>
  );
}
