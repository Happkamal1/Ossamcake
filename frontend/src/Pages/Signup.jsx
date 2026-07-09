import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CakeSlice, Mail, Lock, User, Sparkles, KeyRound, Fingerprint } from "lucide-react";
import { toast } from "sonner";
import {
  registerUser,
  verifyEmail,
  resendOtp,
  setTempEmail
} from "@/features/auth/authSlice";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import PasskeyModal from "@/components/auth/PasskeyModal";

export default function Signup() {
  const [screen, setScreen] = useState("register"); // 'register' | 'verifyEmail'
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, isAuthenticated, tempEmail } = useSelector((state) => state.auth);

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get("redirect") || "/";

  // Countdown timer state for Resend OTP
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  // Start countdown function
  const startTimer = (seconds = 45) => {
    setTimer(seconds);
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

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Format timer helper (returns "MM:SS" or "00:SS")
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Redirect if already authenticated (e.g. social login)
  useEffect(() => {
    if (isAuthenticated) {
      navigate(decodeURIComponent(redirect));
    }
  }, [isAuthenticated, navigate, redirect]);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      toast.error("Please fill in all details.");
      return;
    }

    const name = `${firstName} ${lastName}`;
    const res = await dispatch(registerUser({ name, email, password }));

    if (res.meta.requestStatus === 'fulfilled') {
      toast.success("Account created successfully. We've sent a verification code to your email.");
      dispatch(setTempEmail(email));
      setScreen("verifyEmail");
      startTimer(45);
    } else {
      toast.error(res.payload || 'Registration failed');
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    const emailToVerify = tempEmail || email;

    if (!emailToVerify) {
      return toast.error("Email is required for verification");
    }
    if (!otp || otp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }

    const res = await dispatch(verifyEmail({
      email: emailToVerify,
      otp: otp
    }));

    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Email verified successfully. Please login.');
      setOtp('');
      navigate(`/login?email=${encodeURIComponent(emailToVerify)}&redirect=${encodeURIComponent(redirect)}`);
    } else {
      toast.error(res.payload || 'Invalid verification code.');
    }
  };

  const handleResendOtp = async () => {
    const emailToVerify = tempEmail || email;
    if (!emailToVerify) return toast.error("Email is required");

    const res = await dispatch(resendOtp({ email: emailToVerify }));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('A new verification code has been sent.');
      startTimer(45);
    } else {
      toast.error(res.payload || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/40 via-background to-secondary/20 py-8 sm:py-12 px-4">
      <div className="max-w-md w-full bg-card p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-border shadow-xl space-y-6 sm:space-y-8 text-left">

        {screen === "register" ? (
          <>
            {/* Header */}
            <div className="text-center space-y-2">
              <Link to="/" className="inline-flex items-center gap-2 text-primary font-extrabold text-2xl">
                <CakeSlice className="h-6 w-6 text-primary" />
                <img src="//images/logo/logo-header.png" alt="OssamCake" className="h-8 object-contain" />
              </Link>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center justify-center gap-1.5 pt-2">
                Create Account <Sparkles className="h-5 w-5 text-primary" />
              </h2>
              <p className="text-xs text-muted-foreground">Sign up to get a 100 points loyalty bonus instantly.</p>
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Sarah"
                      className="bg-secondary border-border focus-visible:ring-ring pl-9 rounded-xl text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Johnson"
                    className="bg-secondary border-border focus-visible:ring-ring rounded-xl text-xs"
                  />
                </div>
              </div>

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

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    minLength={6}
                    className="bg-secondary border-border focus-visible:ring-ring pl-10 rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 rounded-xl font-bold py-6 text-sm mt-2 transition-all shadow-md"
              >
                {loading ? "Registering..." : "Register Now"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-medium">Or register with</span>
              </div>
            </div>

            <div className="space-y-3 flex flex-col items-center w-full">
              <GoogleLoginButton />

              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasskeyModalOpen(true)}
                disabled={loading}
                className="w-full max-w-[375px] h-[40px] flex items-center justify-center gap-2 border border-border bg-background text-foreground hover:bg-secondary font-semibold rounded-md text-sm transition-colors shadow-sm"
              >
                <Fingerprint className="w-5 h-5 text-primary animate-pulse" />
                Register with Passkey
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground pt-4">
              Already have an account?{" "}
              <Link to={`/login?redirect=${redirect}`} className="text-primary font-bold hover:underline">
                Login here
              </Link>
            </p>
          </>
        ) : (
          <>
            {/* Verify Email screen */}
            <div className="text-center space-y-2">
              <Link to="/" className="inline-flex items-center gap-2 text-primary font-extrabold text-2xl">
                <CakeSlice className="h-6 w-6 text-primary" />
                <img src="//images/logo/logo-header.png" alt="OssamCake" className="h-8 object-contain" />
              </Link>
              <h2 className="text-2xl font-extrabold text-foreground flex items-center justify-center gap-1.5 pt-2">
                Verify Your Email <KeyRound className="h-5 w-5 text-primary" />
              </h2>
              <div className="text-xs text-muted-foreground space-y-1 pt-1">
                <p>We've sent a 6-digit OTP verification code to:</p>
                <p className="font-semibold text-primary">{tempEmail || email}</p>
              </div>
            </div>

            <form onSubmit={handleVerifyEmail} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="otp">6-digit OTP Code</Label>
                <div className="relative">
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
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 rounded-xl font-bold py-6 text-sm transition-all shadow-md"
              >
                {loading ? "Verifying..." : "Verify Email"}
              </Button>
            </form>

            <div className="flex justify-between items-center text-xs mt-6 pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={timer > 0 || loading}
                className={`font-semibold hover:underline ${timer > 0 ? 'text-muted-foreground cursor-not-allowed' : 'text-primary'}`}
              >
                {timer > 0 ? `Resend OTP in ${formatTime(timer)}` : 'Resend OTP'}
              </button>
              <button
                type="button"
                onClick={() => setScreen("register")}
                className="text-muted-foreground font-semibold hover:text-foreground transition-colors hover:underline"
              >
                Back to Register
              </button>
            </div>
          </>
        )}

      </div>

      <PasskeyModal
        isOpen={isPasskeyModalOpen}
        onClose={() => setIsPasskeyModalOpen(false)}
        mode="signup"
      />
    </div>
  );
}
