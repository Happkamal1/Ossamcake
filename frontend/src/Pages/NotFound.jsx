import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CakeSlice } from "lucide-react";

export default function NotFound() {
  return (
    <div className="bg-background min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center text-primary mb-6 shadow-inner animate-bounce">
        <CakeSlice className="h-12 w-12" />
      </div>
      <h1 className="text-6xl font-black text-primary mb-2">404</h1>
      <h2 className="text-2xl font-extrabold text-foreground mb-4">Oops! Page is Missing</h2>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8 leading-relaxed">
        The page you are looking for has been sliced and eaten! Let's get you back to browsing our delicious menu.
      </p>
      <div className="flex gap-4">
        <Button asChild className="bg-primary hover:bg-primary rounded-full font-bold px-8 py-5">
          <Link to="/">Go Home</Link>
        </Button>
        <Button asChild variant="outline" className="border-border text-primary hover:bg-secondary rounded-full font-bold px-8 py-5">
          <Link to="/shop">Explore Shop</Link>
        </Button>
      </div>
    </div>
  );
}
