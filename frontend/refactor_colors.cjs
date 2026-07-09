const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Regex patterns and their replacements
const replacements = [
  // Primary (Pink)
  { regex: /bg-pink-[456]00/g, replacement: 'bg-primary' },
  { regex: /hover:bg-pink-[567]00/g, replacement: 'hover:bg-primary/90' },
  { regex: /text-pink-[456]00/g, replacement: 'text-primary' },
  { regex: /hover:text-pink-[567]00/g, replacement: 'hover:text-primary/90' },
  { regex: /border-pink-[456]00/g, replacement: 'border-primary' },
  { regex: /ring-pink-[456]00/g, replacement: 'ring-ring' },
  { regex: /focus-visible:ring-pink-[456]00/g, replacement: 'focus-visible:ring-ring' },
  
  // Secondary / Soft Backgrounds (Light Pink)
  { regex: /bg-pink-(?:50|100|150|105)(?:\/\d+)?/g, replacement: 'bg-secondary' },
  { regex: /border-pink-(?:50|100|150|200)(?:\/\d+)?/g, replacement: 'border-border' },
  
  // Foreground / Text (Dark Grays)
  { regex: /text-gray-[789]00/g, replacement: 'text-foreground' },
  
  // Muted Foreground (Mid Grays)
  { regex: /text-gray-(?:400|450|500|600|650)/g, replacement: 'text-muted-foreground' },
  { regex: /text-gray-[23]00/g, replacement: 'text-muted' },
  
  // Background / Borders (Light Grays)
  { regex: /bg-gray-(?:50|100|200)/g, replacement: 'bg-muted' },
  { regex: /border-gray-(?:100|200|300)/g, replacement: 'border-border' },

  // Interactive states
  { regex: /group-hover:text-pink-[456]00/g, replacement: 'group-hover:text-primary' },
  { regex: /peer-checked:bg-pink-[456]00/g, replacement: 'peer-checked:bg-primary' },

  // specific hardcoded cases
  { regex: /text-pink-500\/80/g, replacement: 'text-primary/80' }
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
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Refactoring complete.');
