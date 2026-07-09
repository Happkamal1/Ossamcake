import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

/**
 * AdminProtectedRoute
 * Guards all /admin/* routes.
 * - Not logged in → redirect to /login
 * - Logged in but not admin/super_admin → 403 Forbidden page
 */
export default function AdminProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (user.role !== "admin" && user.role !== "super_admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4 p-8">
          <div className="text-8xl font-black text-slate-700">403</div>
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-slate-400">You don't have permission to access the admin panel.</p>
          <a href="/" className="inline-block mt-4 px-6 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return children;
}
