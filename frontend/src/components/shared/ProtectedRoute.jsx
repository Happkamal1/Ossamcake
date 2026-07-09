import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    const redirectPath = encodeURIComponent(location.pathname + location.search);

    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-card p-8 rounded-3xl border border-border shadow-xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-foreground">Login Required</h2>
            <p className="text-sm text-muted-foreground">
              Please login or create an account to access this page.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={() => navigate(`/login?redirect=${redirectPath}`)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-12">
              Login
            </Button>
            
            <Button onClick={() => navigate(`/signup?redirect=${redirectPath}`)} variant="outline" className="w-full border-border hover:bg-secondary rounded-xl h-12">
              Create Account
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mt-2 text-muted-foreground hover:text-foreground"
            >
              Cancel (Go Back)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
