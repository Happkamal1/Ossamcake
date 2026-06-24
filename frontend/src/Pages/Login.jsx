import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CakeSlice, Mail, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please fill in all credentials.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success("Welcome back to OssamCake!");
        navigate("/");
      }
    } catch (err) {
      toast.error("Invalid credentials. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-[#FFF8F9] to-purple-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-pink-100/50 shadow-xl space-y-8 text-left">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 text-pink-500 font-extrabold text-2xl">
            <CakeSlice className="h-6 w-6 text-pink-500" />
            <span>OssamCake</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center justify-center gap-1.5 pt-2">
            Welcome Back <Sparkles className="h-5 w-5 text-pink-500" />
          </h2>
          <p className="text-xs text-gray-500">Access your custom orders, tracking, and wishlists.</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-pink-50/10 border-pink-100 focus-visible:ring-pink-500 pl-10 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs text-pink-650 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-pink-50/10 border-pink-100 focus-visible:ring-pink-500 pl-10 rounded-xl"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 rounded-xl font-bold py-6 text-sm"
          >
            {loading ? "Authenticating..." : "Login"}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-500 pt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-pink-650 font-bold hover:underline">
            Register Here
          </Link>
        </p>

      </div>
    </div>
  );
}
