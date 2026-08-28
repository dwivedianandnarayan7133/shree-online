const { UPLOAD_PATHS } = require('../config/constants');
﻿const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const zipService = require('../services/zipService');
const pdfService = require('../services/pdfService');

// Compress generic file or multiple files
const compressFiles = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload files to compress.' });
    }

    const { quality = 'medium' } = req.body; // 'low', 'medium', 'high'
    const results = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      const origSize = file.size;

      if (ext === '.pdf') {
        const compPdf = await pdfService.compressPdf(file.path, quality);
        results.push({
          originalName: file.originalname,
          fileName: compPdf.fileName,
          downloadUrl: `/uploads/processed/${compPdf.fileName}`,
          originalSize: compPdf.originalSize,
          compressedSize: compPdf.compressedSize,
          reductionPercent: compPdf.reductionPercent
        });
      } else if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        const qualityVal = quality === 'low' ? 50 : quality === 'medium' ? 70 : 85;
        const outName = `compressed-${Date.now()}-${file.filename}`;
        const outPath = path.join(UPLOAD_PATHS.PROCESSED, outName);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });

        if (ext === '.png') {
          await sharp(file.path).png({ quality: qualityVal, compressionLevel: 9 }).toFile(outPath);
        } else if (ext === '.webp') {
          await sharp(file.path).webp({ quality: qualityVal }).toFile(outPath);
        } else {
          await sharp(file.path).jpeg({ quality: qualityVal, mozjpeg: true }).toFile(outPath);
        }

        const newStat = fs.statSync(outPath);
        const reductionPercent = Math.max(0, Math.round(((origSize - newStat.size) / origSize) * 100));

        results.push({
          originalName: file.originalname,
          fileName: outName,
          downloadUrl: `/uploads/processed/${outName}`,
          originalSize: origSize,
          compressedSize: newStat.size,
          reductionPercent
        });
      } else {
        // Create single zip for other types
        const zipRes = await zipService.createZip([{ path: file.path, name: file.originalname }]);
        const reductionPercent = Math.max(0, Math.round(((origSize - zipRes.size) / origSize) * 100));
        results.push({
          originalName: file.originalname,
          fileName: zipRes.fileName,
          downloadUrl: `/uploads/processed/${zipRes.fileName}`,
          originalSize: origSize,
          compressedSize: zipRes.size,
          reductionPercent
        });
      }
    }

    res.json({
      success: true,
      message: 'Files compressed successfully.',
      results
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create ZIP from uploaded files
const createZipArchive = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload files to zip.' });
    }

    const { zipName = 'cybercafe_archive.zip' } = req.body;
    const items = files.map(f => ({ path: f.path, name: f.originalname }));
    const result = await zipService.createZip(items, zipName.endsWith('.zip') ? zipName : `${zipName}.zip`);

    res.json({
      success: true,
      message: 'ZIP archive created successfully.',
      downloadUrl: `/uploads/processed/${result.fileName}`,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Extract ZIP archive
const extractZipArchive = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a ZIP file.' });
    }

    const result = zipService.extractZip(file.path);

    res.json({
      success: true,
      message: `ZIP archive inspected and extracted (${result.totalFiles} files).`,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  compressFiles,
  createZipArchive,
  extractZipArchive
};
