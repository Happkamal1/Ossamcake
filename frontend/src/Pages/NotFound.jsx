import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CakeSlice } from "lucide-react";

export default function NotFound() {
  return (
    <div className="bg-[#FFF8F9] min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="h-24 w-24 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 mb-6 shadow-inner animate-bounce">
        <CakeSlice className="h-12 w-12" />
      </div>
      <h1 className="text-6xl font-black text-pink-500 mb-2">404</h1>
      <h2 className="text-2xl font-extrabold text-gray-800 mb-4">Oops! Page is Missing</h2>
      <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8 leading-relaxed">
        The page you are looking for has been sliced and eaten! Let's get you back to browsing our delicious menu.
      </p>
      <div className="flex gap-4">
        <Button asChild className="bg-pink-500 hover:bg-pink-600 rounded-full font-bold px-8 py-5">
          <Link to="/">Go Home</Link>
        </Button>
        <Button asChild variant="outline" className="border-pink-200 text-pink-650 hover:bg-pink-50 rounded-full font-bold px-8 py-5">
          <Link to="/shop">Explore Shop</Link>
        </Button>
      </div>
    </div>
  );
}
