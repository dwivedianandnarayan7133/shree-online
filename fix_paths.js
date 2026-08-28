const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, 'server');
let fixedCount = 0;

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules') walkDir(fullPath);
    } else if (file.endsWith('.js')) {
      fixFile(fullPath);
    }
  }
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  const relPath = path.relative(serverDir, filePath).replace(/\\/g, '/');

  // Skip constants.js itself
  if (relPath.includes('config/constants.js')) return;

  const relConstants = relPath.includes('/') ? '../config/constants' : './config/constants';

  let needsImport = false;

  if (content.includes("path.join(__dirname, '../uploads/processed'") || content.includes('path.join(__dirname, "../uploads/processed"')) {
    needsImport = true;
    content = content.replace(/path\.join\(__dirname,\s*['"]\.\.\/uploads\/processed['"],?\s*/g, 'path.join(UPLOAD_PATHS.PROCESSED, ');
  }

  if (content.includes("path.join(__dirname, '../uploads/temp'") || content.includes('path.join(__dirname, "../uploads/temp"')) {
    needsImport = true;
    content = content.replace(/path\.join\(__dirname,\s*['"]\.\.\/uploads\/temp['"],?\s*/g, 'path.join(UPLOAD_PATHS.TEMP, ');
  }

  if (content.includes("path.join(__dirname, '../uploads/customer_records'") || content.includes('path.join(__dirname, "../uploads/customer_records"')) {
    needsImport = true;
    content = content.replace(/path\.join\(__dirname,\s*['"]\.\.\/uploads\/customer_records['"],?\s*/g, 'path.join(UPLOAD_PATHS.CUSTOMER, ');
  }

  if (needsImport && !content.includes('UPLOAD_PATHS')) {
    content = `const { UPLOAD_PATHS } = require('${relConstants}');\n` + content;
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Fixed upload paths in:', relPath);
    fixedCount++;
  }
}

walkDir(serverDir);
console.log(`Total files updated: ${fixedCount}`);
