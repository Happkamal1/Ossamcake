import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Palette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { setTheme } from '@/features/theme/themeSlice';
import { themes } from '@/config/themes';

export default function ThemeSwitcher() {
  const dispatch = useDispatch();
  const { activeTheme, availableThemes } = useSelector((state) => state.theme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="p-2 text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-full transition-all focus:outline-none"
          aria-label="Switch Theme"
          title="Switch Theme"
        >
          <Palette className="h-5.5 w-5.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card border border-border rounded-xl p-1.5 shadow-xl z-[100]">
        <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Select Theme
        </div>
        {availableThemes.map((themeInfo) => {
          const themeDetails = themes[themeInfo.id];
          const primaryColor = themeDetails?.variables['--primary'];
          
          return (
            <DropdownMenuItem 
              key={themeInfo.id} 
              onClick={() => dispatch(setTheme(themeInfo.id))}
              className={`px-3 py-2.5 text-sm font-semibold rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${
                activeTheme === themeInfo.id 
                  ? "bg-primary/10 text-primary" 
                  : "text-foreground hover:bg-secondary hover:text-primary"
              }`}
            >
              <div 
                className="w-4 h-4 rounded-full border border-border shadow-sm flex-shrink-0" 
                style={{
                  backgroundColor: `hsl(${primaryColor})`
                }}
              />
              <span className="capitalize flex-1">{themeInfo.name}</span>
              {activeTheme === themeInfo.id && (
                <span className="ml-auto text-[10px] uppercase text-primary font-bold">Active</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
