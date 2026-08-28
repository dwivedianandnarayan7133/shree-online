const archiver = require('archiver');
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * Compress multiple files into a single ZIP archive
 */
async function createZip(fileItems, zipName = null) {
  const outName = zipName || `archive-${Date.now()}-${uuidv4().substring(0, 6)}.zip`;
  const outPath = path.join(__dirname, '../uploads/processed', outName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const output = fs.createWriteStream(outPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      resolve({
        filePath: outPath,
        fileName: outName,
        size: archive.pointer(),
        fileCount: fileItems.length
      });
    });

    archive.on('error', err => reject(err));
    archive.pipe(output);

    fileItems.forEach(item => {
      if (fs.existsSync(item.path)) {
        archive.file(item.path, { name: item.name || path.basename(item.path) });
      }
    });

    archive.finalize();
  });
}

/**
 * Inspect and extract a ZIP file
 */
function extractZip(zipPath) {
  const zip = new AdmZip(zipPath);
  const zipEntries = zip.getEntries();
  const extractDir = path.join(__dirname, '../uploads/temp', `extracted-${Date.now()}-${uuidv4().substring(0, 6)}`);
  fs.mkdirSync(extractDir, { recursive: true });

  zip.extractAllTo(extractDir, true);

  const extractedFiles = zipEntries.map(entry => ({
    name: entry.entryName,
    isDirectory: entry.isDirectory,
    size: entry.header.size,
    compressedSize: entry.header.compressedSize
  }));

  return {
    extractDir,
    files: extractedFiles,
    totalFiles: extractedFiles.filter(f => !f.isDirectory).length
  };
}

module.exports = { createZip, extractZip };
