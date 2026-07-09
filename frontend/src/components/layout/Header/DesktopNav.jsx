import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MAIN_NAV } from "@/config/navigation";

export default function DesktopNav() {
  return (
    <nav className="hidden lg:flex items-center gap-6 mr-4 text-sm font-bold text-foreground">
      {MAIN_NAV.map((item, idx) => {
        if (item.isDropdown) {
          return (
            <DropdownMenu key={idx}>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-primary transition-colors focus:outline-none">
                {item.label} <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-card border border-border rounded-xl p-1.5 shadow-xl">
                {item.items.map((subItem, subIdx) => (
                  <DropdownMenuItem key={subIdx} asChild>
                    <Link
                      to={subItem.href}
                      className="w-full text-left px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary hover:text-primary rounded-lg cursor-pointer transition-colors"
                    >
                      {subItem.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        return (
          <Link
            key={idx}
            to={item.href}
            className="hover:text-primary transition-colors"
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
