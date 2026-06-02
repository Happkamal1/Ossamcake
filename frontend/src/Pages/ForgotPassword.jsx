import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiUrl } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      await axios.post(apiUrl("/api/users/forgot-password"), { email });
      toast.success("If an account exists, reset instructions were sent.");
    } catch (err) {
      if (err.response?.status === 404) {
        toast.info(
          "Password reset is not configured on the server yet. Contact support at info@ossamcake.com.",
        );
      } else {
        toast.error("Could not send reset email. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-500 to-pink-700 py-12 px-4">
      <ToastContainer position="top-center" theme="colored" />
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Forgot password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we will send reset instructions if your account
            exists.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700"
          >
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600">
          <Link to="/login" className="text-pink-600 hover:text-pink-500">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
