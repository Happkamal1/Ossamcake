import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "@/features/theme/themeSlice";
import { logoutUser } from "@/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  Palette, 
  Trash2, 
  LogOut, 
  HelpCircle, 
  Globe, 
  Bell, 
  ShieldAlert 
} from "lucide-react";
import { themes } from "@/config/themes";
import { toast } from "sonner";

export default function DashboardSettings({ user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeTheme, availableThemes } = useSelector((state) => state.theme);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
    toast.success("Successfully logged out.");
  };

  const handleDeleteAccount = () => {
    const doubleConfirm = confirm(
      "WARNING: Are you absolutely sure you want to delete your account? This action is irreversible, and you will lose all loyalty points, saved addresses, and past order history."
    );
    if (doubleConfirm) {
      toast.error("Account deletion requested. Please contact administrative support to verify identity.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* THEME SELECTION PANEL */}
      <Card className="border border-border shadow-sm rounded-3xl bg-card text-left">
        <CardHeader>
          <CardTitle className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <Palette className="h-5.5 w-5.5 text-primary" /> Visual Appearance
          </CardTitle>
          <CardDescription>Select your preferred background visual theme stylesheet styling.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {availableThemes.map((themeInfo) => {
              const themeDetails = themes[themeInfo.id];
              const primaryColor = themeDetails?.variables?.['--primary'] || "322 81% 53%";
              const isActive = activeTheme === themeInfo.id;

              return (
                <div 
                  key={themeInfo.id}
                  onClick={() => dispatch(setTheme(themeInfo.id))}
                  className={`border p-4 rounded-2xl flex items-center gap-3 cursor-pointer select-none transition-all hover:border-primary/40 ${
                    isActive ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border"
                  }`}
                >
                  <div 
                    className="w-5 h-5 rounded-full border border-border shadow-sm flex-shrink-0"
                    style={{ backgroundColor: `hsl(${primaryColor})` }}
                  />
                  <div className="text-xs text-left">
                    <p className="font-extrabold text-foreground capitalize">{themeInfo.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Preset palette</p>
                  </div>
                  {isActive && (
                    <Badge className="ml-auto bg-primary text-primary-foreground text-[8px] px-1 pointer-events-none uppercase font-bold">Active</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ADDITIONAL PREFERENCES CARD */}
      <Card className="border border-border shadow-sm rounded-3xl bg-card text-left">
        <CardHeader>
          <CardTitle className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
            <Settings className="h-4 w-4 text-primary" /> System Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs font-semibold">
          
          {/* Language selection placeholder */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
            <div className="space-y-0.5 text-left">
              <p className="font-extrabold text-foreground flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-primary" /> Language Preference
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">Configure your translation language dictionary.</p>
            </div>
            <select disabled className="rounded-xl border border-border bg-secondary/50 px-2 py-1 h-9 text-xs font-bold text-muted-foreground cursor-not-allowed">
              <option value="en">English (US)</option>
              <option value="es">Español (Coming Soon)</option>
            </select>
          </div>

          {/* Notifications settings placeholder */}
          <div className="flex items-center justify-between pb-1">
            <div className="space-y-0.5 text-left">
              <p className="font-extrabold text-foreground flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-primary" /> Email Notifications
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">Subscribe/Unsubscribe to order updates via email letters.</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black h-6 pointer-events-none uppercase">Enabled</Badge>
          </div>

        </CardContent>
      </Card>

      {/* DANGER ZONE PANEL */}
      <Card className="border border-destructive/30 bg-destructive/5 shadow-sm rounded-3xl text-left">
        <CardHeader>
          <CardTitle className="text-xl font-extrabold text-destructive flex items-center gap-2">
            <ShieldAlert className="h-5.5 w-5.5 text-destructive animate-pulse" /> Danger Zone
          </CardTitle>
          <CardDescription className="text-destructive/80">Irreversible actions relating to your user profile credentials.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
          <div className="space-y-1 text-xs text-left font-medium leading-normal text-destructive-foreground/80">
            <p className="font-extrabold text-foreground text-sm">Delete Account Profile</p>
            <p className="text-muted-foreground text-xs">Permanently purge your account, data, rewards points, and address records.</p>
          </div>
          <Button
            onClick={handleDeleteAccount}
            variant="destructive"
            className="rounded-xl font-bold h-11 px-6 shadow-md transition-all flex-shrink-0"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
