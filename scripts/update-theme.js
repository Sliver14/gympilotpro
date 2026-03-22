const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Safer replacements
  content = content.replace(/bg-\[#111\]/g, 'bg-card');
  content = content.replace(/border-white\/[0-9]+/g, 'border-border');
  content = content.replace(/border-white/g, 'border-border'); // generic border-white
  content = content.replace(/bg-black\/[0-9]+/g, 'bg-card/50');
  
  // Replace standalone bg-black but be careful not to match text-black or bg-black/50
  content = content.replace(/\bbg-black(?![\/\-\w])/g, 'bg-background');
  
  // bg-white/5 is often used for subtle backgrounds on elements
  content = content.replace(/bg-white\/[0-9]+/g, 'bg-accent');
  content = content.replace(/hover:bg-white\/[0-9]+/g, 'hover:bg-accent hover:text-accent-foreground');
  content = content.replace(/hover:border-white\/[0-9]+/g, 'hover:border-border');
  
  // Replace text-gray with muted-foreground
  content = content.replace(/text-gray-[34567]00/g, 'text-muted-foreground');
  
  // Specific fix for text-white. We only want to replace text-white if it's not part of a colored background button
  // Actually, standardizing on text-foreground or text-card-foreground is better for these layouts
  // But to avoid breaking button text, we can use a more specific regex or just replace it and let Tailwind handle it.
  content = content.replace(/(?<!bg-[a-z]+-[0-9]+\s+)\btext-white\b/g, 'text-foreground');
  content = content.replace(/hover:text-white/g, 'hover:text-foreground');
  content = content.replace(/focus:text-white/g, 'focus:text-foreground');
  
  // Data state checked
  content = content.replace(/data-\[state=checked\]:text-black/g, 'data-[state=checked]:text-primary-foreground');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') && !fullPath.includes('sidebar') && !fullPath.includes('revenue-analytics')) {
      replaceInFile(fullPath);
    }
  });
}

walkDir('./components/admin');
walkDir('./components/member');
walkDir('./app/(gym)');
