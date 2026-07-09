import { useState } from "react";
import { useDispatch } from "react-redux";
import { getPasskeyRegisterOptions, verifyPasskeyRegister, deletePasskey } from "@/features/auth/authSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Fingerprint, 
  Trash2, 
  Plus, 
  Smartphone, 
  Monitor, 
  Chrome,
  Key,
  Shield,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { startRegistration } from "@simplewebauthn/browser";
import { motion } from "framer-motion";

export default function PasskeyManager({ user }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleRegisterPasskey = async () => {
    setLoading(true);
    try {
      const optionsRes = await dispatch(getPasskeyRegisterOptions());
      if (optionsRes.meta.requestStatus === 'rejected') {
        toast.error(optionsRes.payload || "Failed to fetch passkey options.");
        return;
      }

      toast.info("Please complete authentication on your biometric prompt.");
      const regRes = await startRegistration(optionsRes.payload.data);

      const verifyRes = await dispatch(verifyPasskeyRegister(regRes));
      if (verifyRes.meta.requestStatus === 'fulfilled') {
        toast.success("Passkey registered successfully! You can now log in passwordless.");
      } else {
        toast.error(verifyRes.payload || "Biometric validation failed.");
      }
    } catch (err) {
      toast.error(err.message || "Passkey enrollment cancelled.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePasskey = async (credentialID) => {
    if (confirm("Are you sure you want to remove this passkey? You will not be able to use it to log in.")) {
      setLoading(true);
      try {
        const res = await dispatch(deletePasskey(credentialID));
        if (res.meta.requestStatus === 'fulfilled') {
          toast.success("Passkey removed successfully.");
        } else {
          toast.error(res.payload || "Failed to remove passkey.");
        }
      } catch (err) {
        toast.error("An error occurred.");
      } finally {
        setLoading(false);
      }
    }
  };

  const getDeviceIcon = (deviceType) => {
    if (deviceType === "crossPlatform" || deviceType?.toLowerCase().includes("usb")) {
      return <Key className="h-5 w-5 text-primary" />;
    }
    return <Smartphone className="h-5 w-5 text-primary" />;
  };

  return (
    <Card className="border border-border shadow-sm rounded-3xl text-left bg-card">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <Fingerprint className="h-5.5 w-5.5 text-primary" /> Biometric Passkeys
          </CardTitle>
          <CardDescription>Link hardware keys, Face ID, or Windows Hello biometrics for passwordless logins.</CardDescription>
        </div>
        <Button 
          onClick={handleRegisterPasskey} 
          disabled={loading}
          size="sm" 
          className="bg-primary hover:bg-primary/95 text-xs font-bold rounded-xl h-9 gap-1"
        >
          <Plus className="h-4 w-4" /> Add Key
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Helper info banner */}
        <div className="flex items-start gap-3 p-4 bg-secondary/30 border border-border rounded-2xl">
          <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-1 text-xs text-muted-foreground leading-normal font-medium">
            <h4 className="font-extrabold text-sm text-foreground">Why use Passkeys?</h4>
            <p>Passkeys are highly secure login credentials backed by biometrics (Touch ID, Face ID, Windows Hello) that cannot be phished or guessed. The private credential keys never leave your secure local hardware processor.</p>
          </div>
        </div>

        {/* List of registered devices */}
        <div className="space-y-3.5">
          <h4 className="font-extrabold text-xs text-foreground uppercase tracking-wider">Registered Passkeys / Devices</h4>
          {user.passkeys && user.passkeys.length > 0 ? (
            <div className="grid grid-cols-1 gap-3.5">
              {user.passkeys.map((pk, idx) => (
                <motion.div 
                  key={pk.credentialID} 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }}
                  className="flex items-center justify-between border border-border p-4 rounded-2xl hover:border-primary/20 transition-all bg-card shadow-sm"
                >
                  <div className="flex items-center gap-3.5 text-left">
                    <div className="h-10 w-10 bg-secondary rounded-xl flex items-center justify-center">
                      {getDeviceIcon(pk.deviceType)}
                    </div>
                    <div className="text-xs space-y-0.5">
                      <p className="font-extrabold text-foreground text-sm flex items-center gap-2">
                        Passkey Device ({pk.deviceType === "platform" ? "On-Device Biometrics" : "Security Key"})
                        {pk.backedUp && (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[8px] px-1 pointer-events-none py-0 font-bold">Backed Up</Badge>
                        )}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-1 font-medium">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground/60" /> 
                        Registered on {new Date(pk.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleRemovePasskey(pk.credentialID)} 
                    variant="ghost" 
                    size="sm"
                    className="text-muted-foreground hover:text-red-500 rounded-xl hover:bg-destructive/10 h-9 px-3 text-xs font-bold"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" /> Remove
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-border rounded-2xl">
              <Fingerprint className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm font-bold text-foreground">No biometric passkeys registered</p>
              <p className="text-xs text-muted-foreground mt-0.5">Set up Touch ID or Windows Hello for instant passwordless logins.</p>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
