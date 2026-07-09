/**
 * Comprehensive Color Refactoring Script v2
 * Targets ALL remaining hardcoded colors across all pages/components
 * Maps them to semantic theme tokens that respond to Redux theme switching
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  // =========================================================
  // PAGE WRAPPER BACKGROUNDS - replace hardcoded hex/rgb background wrappers
  // =========================================================
  { regex: /bg-\[#FFF8F9\]/g, replacement: 'bg-background' },
  { regex: /bg-\[#FFF0F5\]/g, replacement: 'bg-background' },
  { regex: /from-pink-50 via-\[#FFF8F9\] to-purple-50/g, replacement: 'from-secondary/40 via-background to-secondary/20' },
  { regex: /from-pink-50 via-white to-purple-50/g, replacement: 'from-secondary/40 via-background to-secondary/20' },
  { regex: /bg-white\b/g, replacement: 'bg-card' },
  { regex: /min-h-screen bg-white\b/g, replacement: 'min-h-screen bg-background' },

  // =========================================================
  // HERO / MISSION SECTIONS - solid pink gradient CTAs
  // =========================================================
  { regex: /bg-gradient-to-r from-pink-500 to-pink-600 text-white/g, replacement: 'bg-primary text-primary-foreground' },
  { regex: /bg-gradient-to-r from-pink-500 to-pink-700/g, replacement: 'bg-gradient-to-r from-primary to-primary/80' },
  { regex: /bg-gradient-to-br from-pink-400 to-pink-600/g, replacement: 'bg-gradient-to-br from-primary to-primary/80' },
  { regex: /bg-gradient-to-br from-pink-100 to-purple-100/g, replacement: 'bg-gradient-to-br from-secondary to-secondary/60' },

  // =========================================================
  // PRIMARY COLORS  
  // =========================================================
  { regex: /\bbg-pink-[56]00\b/g, replacement: 'bg-primary' },
  { regex: /hover:bg-pink-[567]00\b/g, replacement: 'hover:bg-primary/90' },
  { regex: /\bbg-pink-650\b/g, replacement: 'bg-primary' },
  { regex: /hover:bg-pink-650\b/g, replacement: 'hover:bg-primary/90' },
  { regex: /\btext-pink-[456]00\b/g, replacement: 'text-primary' },
  { regex: /\btext-pink-500\/80\b/g, replacement: 'text-primary/80' },
  { regex: /\btext-pink-600\b/g, replacement: 'text-primary' },
  { regex: /\btext-pink-650\b/g, replacement: 'text-primary' },
  { regex: /hover:text-pink-[567]00\b/g, replacement: 'hover:text-primary' },
  { regex: /hover:text-pink-650\b/g, replacement: 'hover:text-primary' },
  { regex: /\bborder-pink-[456]00\b/g, replacement: 'border-primary' },
  { regex: /\bborder-pink-300\b/g, replacement: 'border-primary/50' },
  { regex: /\bring-pink-[456]00\b/g, replacement: 'ring-ring' },
  { regex: /focus-visible:ring-pink-[456]00\b/g, replacement: 'focus-visible:ring-ring' },
  { regex: /shadow-pink-100\b/g, replacement: 'shadow-primary/10' },
  { regex: /shadow-pink-\d+\b/g, replacement: 'shadow-primary/20' },
  { regex: /group-hover:text-pink-[456]00\b/g, replacement: 'group-hover:text-primary' },
  { regex: /\btext-pink-100\b/g, replacement: 'text-primary-foreground/80' },

  // =========================================================
  // SECONDARY / SOFT BACKGROUNDS (light pinks)
  // =========================================================
  { regex: /\bbg-pink-50(?:\/\d+)?\b/g, replacement: 'bg-secondary' },
  { regex: /\bbg-pink-100(?:\/\d+)?\b/g, replacement: 'bg-secondary' },
  { regex: /\bbg-pink-150\b/g, replacement: 'bg-secondary' },
  { regex: /\bbg-pink-105\b/g, replacement: 'bg-secondary' },
  { regex: /hover:bg-secondary transition-colors/g, replacement: 'hover:bg-secondary/80 transition-colors' },
  
  // =========================================================
  // BORDERS (light pinks)
  // =========================================================
  { regex: /\bborder-pink-50(?:\/\d+)?\b/g, replacement: 'border-border' },
  { regex: /\bborder-pink-100(?:\/\d+)?\b/g, replacement: 'border-border' },
  { regex: /\bborder-pink-150\b/g, replacement: 'border-border' },
  { regex: /\bborder-pink-200(?:\/\d+)?\b/g, replacement: 'border-border' },
  { regex: /\bborder-gray-50\b/g, replacement: 'border-border' },
  { regex: /\bborder-gray-100\b/g, replacement: 'border-border' },
  { regex: /\bborder-gray-200\b/g, replacement: 'border-border' },
  { regex: /\bborder-gray-300\b/g, replacement: 'border-border' },

  // =========================================================
  // FOREGROUND TEXT (dark grays -> semantic text tokens)
  // =========================================================
  { regex: /\btext-gray-900\b/g, replacement: 'text-foreground' },
  { regex: /\btext-gray-800\b/g, replacement: 'text-foreground' },
  { regex: /\btext-gray-850\b/g, replacement: 'text-foreground' },
  { regex: /\btext-gray-750\b/g, replacement: 'text-foreground' },

  // =========================================================
  // MUTED FOREGROUND TEXT (mid grays)
  // =========================================================
  { regex: /\btext-gray-500\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-gray-600\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-gray-650\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-gray-450\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-gray-400\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-gray-300\b/g, replacement: 'text-muted' },

  // =========================================================
  // MUTED BACKGROUNDS (light grays)
  // =========================================================
  { regex: /\bbg-gray-50\b/g, replacement: 'bg-muted' },
  { regex: /\bbg-gray-100\b/g, replacement: 'bg-muted' },
  { regex: /\bbg-gray-200\b/g, replacement: 'bg-muted' },

  // =========================================================
  // PURPLE CATEGORY TAG (special semantic alternative for variant tags in cart)
  // =========================================================
  { regex: /\bbg-purple-50 text-purple-600 px-2 py-0\.5 rounded font-semibold border border-purple-100\b/g, replacement: 'bg-accent/10 text-accent-foreground px-2 py-0.5 rounded font-semibold border border-border' },
  { regex: /\bbg-purple-50\b/g, replacement: 'bg-accent/10' },
  { regex: /\btext-purple-[456]00\b/g, replacement: 'text-foreground' },
  { regex: /\bborder-purple-100\b/g, replacement: 'border-border' },
  { regex: /\bbg-purple-600\b/g, replacement: 'bg-accent' },

  // =========================================================
  // FOOTER specific hover states - safely handled
  // =========================================================
  // Footer uses bg-foreground/bg-background intentionally, leave those alone

  // =========================================================
  // ABOUT / CAREER / CONTACT - hardcoded font style attribute
  // =========================================================
  { regex: /style=\{\{ fontFamily: "'Inter', sans-serif" \}\}/g, replacement: '' },

  // =========================================================
  // INLINE BACKGROUNDS - career & about static pages
  // =========================================================
  { regex: /bg-\[#FFF8F9\]/g, replacement: 'bg-background' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✓ Updated: ${fullPath.replace(__dirname + '/src/', 'src/')}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('\n✅ Phase 2 comprehensive refactoring complete.');
