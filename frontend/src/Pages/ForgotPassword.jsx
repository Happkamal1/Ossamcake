import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CakeSlice, Mail, Lock, Sparkles, KeyRound, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import {
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  setTempEmail
} from "@/features/auth/authSlice";

export default function ForgotPassword() {
  const [screen, setScreen] = useState("forgotPassword"); // 'forgotPassword' | 'verifyResetOtp' | 'resetPassword'
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, tempEmail } = useSelector((state) => state.auth);

  // Prefill email from query parameter on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location.search]);

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      return toast.error("Email is required");
    }

    const res = await dispatch(forgotPassword({ email }));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Password reset OTP sent to your email.');
      dispatch(setTempEmail(email));
      setScreen('verifyResetOtp');
    } else {
      toast.error(res.payload || 'Failed to send OTP.');
    }
  };

  const handleVerifyResetOtpSubmit = async (e) => {
    e.preventDefault();
    const emailToVerify = tempEmail || email;
    if (!otp || otp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }

    const res = await dispatch(verifyResetOtp({ email: emailToVerify, otp }));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('OTP verified. You can now reset your password.');
      setScreen('resetPassword');
    } else {
      toast.error(res.payload || 'Invalid reset OTP.');
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    const emailToVerify = tempEmail || email;

    if (!password || password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    const res = await dispatch(resetPassword({
      email: emailToVerify,
      otp,
      password
    }));

    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Password updated successfully. Please login.');
      setOtp('');
      setPassword('');
      setConfirmPassword('');
      navigate(`/login?email=${encodeURIComponent(emailToVerify)}`);
    } else {
      toast.error(res.payload || 'Failed to reset password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/40 via-background to-secondary/20 py-12 px-4">
      <div className="max-w-md w-full bg-card p-8 rounded-3xl border border-border shadow-xl space-y-8 text-left">

        {screen === "forgotPassword" && (
          <>
            {/* Forgot Password Request Screen */}
            <div className="text-center space-y-2">
              <Link to="/" className="inline-flex items-center gap-2 text-primary font-extrabold text-2xl">
                <CakeSlice className="h-6 w-6 text-primary" />
                <img src="//images/logo/logo-header.png" alt="OssamCake" className="h-8 object-contain" />
              </Link>
              <h2 className="text-2xl font-extrabold text-foreground flex items-center justify-center gap-1.5 pt-2">
                Forgot Password <Sparkles className="h-5 w-5 text-primary" />
              </h2>
              <p className="text-xs text-muted-foreground">
                Enter your email address to receive a password reset OTP verification code.
              </p>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
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
                className="w-full bg-primary hover:bg-primary/90 rounded-xl font-bold py-6 text-sm mt-2 transition-all shadow-md"
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
              <Link to="/login" className="text-primary font-bold hover:underline">
                Back to Login
              </Link>
            </p>
          </>
        )}

        {screen === "verifyResetOtp" && (
          <>
            {/* Verify Reset OTP Screen */}
            <div className="text-center space-y-2">
              <Link to="/" className="inline-flex items-center gap-2 text-primary font-extrabold text-2xl">
                <CakeSlice className="h-6 w-6 text-primary" />
                <img src="//images/logo/logo-header.png" alt="OssamCake" className="h-8 object-contain" />
              </Link>
              <h2 className="text-2xl font-extrabold text-foreground flex items-center justify-center gap-1.5 pt-2">
                Verify OTP <KeyRound className="h-5 w-5 text-primary" />
              </h2>
              <div className="text-xs text-muted-foreground space-y-1 pt-1">
                <p>Please enter the 6-digit OTP verification code sent to:</p>
                <p className="font-semibold text-primary">{tempEmail || email}</p>
              </div>
            </div>

            <form onSubmit={handleVerifyResetOtpSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="otp">6-digit Reset OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="bg-secondary border-border focus-visible:ring-ring rounded-xl text-center tracking-widest font-bold text-lg h-12"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 rounded-xl font-bold py-6 text-sm mt-2 transition-all shadow-md"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setScreen("forgotPassword")}
                className="text-primary font-bold hover:underline"
              >
                Back to Email Entry
              </button>
            </p>
          </>
        )}

        {screen === "resetPassword" && (
          <>
            {/* Reset Password Screen */}
            <div className="text-center space-y-2">
              <Link to="/" className="inline-flex items-center gap-2 text-primary font-extrabold text-2xl">
                <CakeSlice className="h-6 w-6 text-primary" />
                <img src="//images/logo/logo-header.png" alt="OssamCake" className="h-8 object-contain" />
              </Link>
              <h2 className="text-2xl font-extrabold text-foreground flex items-center justify-center gap-1.5 pt-2">
                Set New Password <LockKeyhole className="h-5 w-5 text-primary" />
              </h2>
              <p className="text-xs text-muted-foreground">
                Define a strong and secure password for your account.
              </p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-secondary border-border focus-visible:ring-ring pl-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-secondary border-border focus-visible:ring-ring pl-10 rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 rounded-xl font-bold py-6 text-sm mt-2 transition-all shadow-md"
              >
                {loading ? "Updating..." : "Reset Password"}
              </Button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
