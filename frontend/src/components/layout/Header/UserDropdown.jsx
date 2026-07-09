import { Link } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { USER_MENU } from "@/config/navigation";

export default function UserDropdown({ user, logout }) {

  if (!user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1.5 p-1 rounded-full border border-border hover:bg-secondary focus:outline-none transition-colors">
            <div className="h-9 w-9 rounded-full bg-secondary text-primary flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-card border border-border rounded-xl p-1.5 shadow-xl">
          <DropdownMenuItem asChild>
            <Link to="/login" className="flex w-full px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary hover:text-primary rounded-lg cursor-pointer">
              Login
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/signup" className="flex w-full px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary hover:text-primary rounded-lg cursor-pointer">
              Create Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  const names = user?.name ? user.name.split(" ") : ["User"];
  const firstName = user?.firstName || names[0];
  const lastName = user?.lastName || (names.length > 1 ? names[names.length - 1] : "");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 p-1 rounded-full border border-border hover:bg-secondary focus:outline-none transition-colors shadow-sm">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-inner">
            {firstName[0] || ""}{lastName[0] || ""}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border border-border rounded-2xl p-2 shadow-2xl">
        <DropdownMenuLabel className="px-3 py-2">
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-foreground">{firstName} {lastName}</span>
            <span className="text-xs text-muted-foreground font-medium">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-secondary" />

        <div className="max-h-[300px] overflow-y-auto">
          {(user?.role === "admin" || user?.role === "super_admin") && (
            <DropdownMenuItem asChild>
              <Link to="/admin/dashboard" className="px-3 py-2.5 text-sm font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5">
                🛡️ Admin Panel
              </Link>
            </DropdownMenuItem>
          )}
          {USER_MENU.map((item, idx) => (
            <DropdownMenuItem key={idx} asChild>
              <Link to={item.href} className="px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary hover:text-primary rounded-xl cursor-pointer transition-colors">
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="bg-secondary" />
        <DropdownMenuItem
          onClick={logout}
          className="px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl cursor-pointer flex items-center gap-2 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
