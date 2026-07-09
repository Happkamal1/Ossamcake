import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fingerprint, Mail, User, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import {
  getPasskeyLoginOptions,
  verifyPasskeyLogin,
  getPasskeySignupOptions,
  verifyPasskeySignup,
} from "@/features/auth/authSlice";

export default function PasskeyModal({ isOpen, onClose, mode = "login" }) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      return toast.error("Email address is required");
    }

    setLoading(true);
    try {
      if (mode === "login") {
        // 1. Get Assertion Options
        const optionsRes = await dispatch(getPasskeyLoginOptions({ email }));
        if (optionsRes.meta.requestStatus === "rejected") {
          throw new Error(optionsRes.payload || "Failed to retrieve login credentials challenge");
        }

        toast.info("Please follow your browser's prompt to verify your biometric key.");

        // 2. Start Biometric Authentication
        const authResponse = await startAuthentication(optionsRes.payload.data);

        // 3. Verify Authentication Response
        const verifyRes = await dispatch(verifyPasskeyLogin(authResponse));
        if (verifyRes.meta.requestStatus === "fulfilled") {
          toast.success("Welcome back! Login via Passkey successful.");
          onClose();
        } else {
          throw new Error(verifyRes.payload || "Passkey signature verification failed");
        }
      } else {
        // mode === "signup"
        // 1. Get Registration Options (name is derived from email on backend)
        const optionsRes = await dispatch(getPasskeySignupOptions({ email }));
        if (optionsRes.meta.requestStatus === "rejected") {
          throw new Error(optionsRes.payload || "Failed to generate passkey signup options");
        }

        toast.info("Please follow your browser's prompt to register your biometric key.");

        // 2. Start Biometric Registration
        const regResponse = await startRegistration(optionsRes.payload.data);

        // 3. Verify Registration Response
        const verifyRes = await dispatch(verifyPasskeySignup(regResponse));
        if (verifyRes.meta.requestStatus === "fulfilled") {
          toast.success("Account created and registered with Passkey successfully!");
          onClose();
        } else {
          throw new Error(verifyRes.payload || "Passkey verification failed");
        }
      }
    } catch (err) {
      toast.error(err.message || "Passkey transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card border border-border p-6 rounded-3xl shadow-2xl text-left">
        <DialogHeader className="space-y-2 text-center sm:text-left">
          <DialogTitle className="text-xl font-extrabold text-foreground flex items-center justify-center sm:justify-start gap-2">
            <Fingerprint className="h-6 w-6 text-primary animate-pulse" />
            {mode === "login" ? "Sign in with Passkey" : "Sign up with Passkey"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {mode === "login"
              ? "Verify your identity using your device's biometric biometrics or security keys."
              : "Register your email and link your biometric key for secure passwordless registration."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">

          <div className="space-y-1.5">
            <Label htmlFor="passkey-email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
              <Input
                id="passkey-email"
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-secondary border-border focus-visible:ring-ring pl-10 rounded-xl"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-5 rounded-xl text-sm transition-all shadow-md mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <Sparkles className="h-4 w-4 animate-spin" /> Working...
              </span>
            ) : mode === "login" ? (
              "Authenticate Passkey"
            ) : (
              "Register Passkey"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
