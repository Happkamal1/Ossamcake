import { useState, useEffect, useRef } from "react";
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
import { KeyRound, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export default function VerificationModal({ isOpen, onClose, email, onVerified }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(45);
  const timerRef = useRef(null);

  const startTimer = () => {
    setTimer(45);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (isOpen) {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  const handleResend = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/resend-otp`, { email }, { withCredentials: true });
      toast.success("Verification code resent to your email.");
      startTimer();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      return toast.error("Please enter a valid 6-digit code.");
    }

    setLoading(true);
    try {
      // Reuses the verification OTP endpoint
      await axios.post(
        `${API_BASE_URL}/auth/verify-email`,
        { email, otp },
        { withCredentials: true }
      );
      
      // Verification succeeded!
      toast.success("Security code verified!");
      onVerified();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card border border-border p-6 rounded-3xl shadow-2xl text-left">
        <DialogHeader className="space-y-2 text-center sm:text-left">
          <DialogTitle className="text-xl font-extrabold text-foreground flex items-center justify-center sm:justify-start gap-2">
            <KeyRound className="h-6 w-6 text-primary animate-pulse" />
            Verify Security Code
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            We have sent a 6-digit security code to your email <strong className="text-primary">{email}</strong> to verify this action.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="verification-otp">6-digit Security OTP</Label>
            <Input
              id="verification-otp"
              type="text"
              maxLength={6}
              disabled={loading}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="bg-secondary border-border focus-visible:ring-ring rounded-xl text-center tracking-widest font-bold text-lg h-12"
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleResend}
              disabled={timer > 0 || loading}
              className={`font-semibold hover:underline ${
                timer > 0 ? "text-muted-foreground cursor-not-allowed" : "text-primary"
              }`}
            >
              {timer > 0 ? `Resend OTP in ${formatTime(timer)}` : "Resend Security Code"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground font-semibold hover:text-foreground transition-colors hover:underline"
            >
              Cancel
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-5 rounded-xl text-sm transition-all shadow-md"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <Sparkles className="h-4 w-4 animate-spin" /> Verifying...
              </span>
            ) : (
              "Confirm & Enable"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
