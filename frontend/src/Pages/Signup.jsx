import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CakeSlice, Mail, Lock, User, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      toast.error("Please fill in all details.");
      return;
    }

    setLoading(true);
    try {
      const res = await signup(firstName, lastName, email, password);
      if (res.success) {
        toast.success("Welcome to OssamCake! Registration successful.");
        navigate("/");
      }
    } catch (err) {
      toast.error("Registration failed. Try again.");
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
            Create Account <Sparkles className="h-5 w-5 text-pink-500" />
          </h2>
          <p className="text-xs text-gray-500">Sign up to get a 100 points loyalty bonus instantly.</p>
        </div>

        <form onSubmit={handleSignupSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Sarah"
                  className="bg-pink-50/10 border-pink-100 focus-visible:ring-pink-500 pl-9 rounded-xl text-xs"
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
                className="bg-pink-50/10 border-pink-100 focus-visible:ring-pink-500 rounded-xl text-xs"
              />
            </div>
          </div>

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
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                className="bg-pink-50/10 border-pink-100 focus-visible:ring-pink-500 pl-10 rounded-xl"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 rounded-xl font-bold py-6 text-sm"
          >
            {loading ? "Registering..." : "Register Now"}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-500 pt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-pink-650 font-bold hover:underline">
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
}
