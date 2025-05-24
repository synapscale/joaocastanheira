const fs = require('fs');
const path = require('path');

function checkDuplicates(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      checkDuplicates(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/function (\w+)/g);
      if (matches) {
        const seen = new Set();
        matches.forEach(fn => {
          if (seen.has(fn)) {
            console.log(`Função duplicada ${fn} em ${fullPath}`);
          }
          seen.add(fn);
        });
      }
    }
  });
}

checkDuplicates('./');
