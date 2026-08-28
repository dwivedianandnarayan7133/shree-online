const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, 'server');
let fixedFiles = [];

function checkAndFix(dir) {
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (item !== 'node_modules') checkAndFix(full);
    } else if (item.endsWith('.js')) {
      const rel = path.relative(serverDir, full).replace(/\\/g, '/');
      if (rel.includes('config/constants.js')) continue;

      let code = fs.readFileSync(full, 'utf-8');
      if (code.includes('UPLOAD_PATHS')) {
        const hasImport = code.includes('UPLOAD_PATHS = require') || code.includes('{ UPLOAD_PATHS }') || code.includes('{UPLOAD_PATHS}');
        if (!hasImport) {
          const relImport = rel.includes('/') ? '../config/constants' : './config/constants';
          code = `const { UPLOAD_PATHS } = require('${relImport}');\n` + code;
          fs.writeFileSync(full, code, 'utf-8');
          fixedFiles.push(rel);
        }
      }
    }
  }
}

checkAndFix(serverDir);
console.log('Fixed missing imports in:', fixedFiles);
