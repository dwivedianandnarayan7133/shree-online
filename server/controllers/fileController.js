const fs = require('fs');
const path = require('path');
const { UPLOAD_PATHS } = require('../config/constants');
const sharp = require('sharp');
const zipService = require('../services/zipService');
const pdfService = require('../services/pdfService');

function fileToDataUri(filePath, mimeType = 'application/octet-stream') {
  try {
    if (fs.existsSync(filePath)) {
      const buf = fs.readFileSync(filePath);
      return `data:${mimeType};base64,${buf.toString('base64')}`;
    }
  } catch (e) {}
  return null;
}

const compressFiles = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload files to compress.' });
    }

    const { quality = 'medium' } = req.body;
    const results = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      const origSize = file.size;

      if (ext === '.pdf') {
        const compPdf = await pdfService.compressPdf(file.path, quality);
        const dataUri = fileToDataUri(compPdf.filePath, 'application/pdf');
        results.push({
          originalName: file.originalname,
          fileName: compPdf.fileName,
          downloadUrl: dataUri || `/uploads/processed/${compPdf.fileName}`,
          dataUri,
          originalSize: compPdf.originalSize,
          compressedSize: compPdf.compressedSize,
          reductionPercent: compPdf.reductionPercent
        });
      } else if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        const qualityVal = quality === 'low' ? 50 : quality === 'medium' ? 70 : 85;
        const outName = `compressed-${Date.now()}-${file.filename || path.basename(file.path)}`;
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
        const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        const dataUri = fileToDataUri(outPath, mime);

        results.push({
          originalName: file.originalname,
          fileName: outName,
          downloadUrl: dataUri || `/uploads/processed/${outName}`,
          dataUri,
          originalSize: origSize,
          compressedSize: newStat.size,
          reductionPercent
        });
      } else {
        const zipRes = await zipService.createZip([{ path: file.path, name: file.originalname }]);
        const reductionPercent = Math.max(0, Math.round(((origSize - zipRes.size) / origSize) * 100));
        const dataUri = fileToDataUri(zipRes.filePath, 'application/zip');
        results.push({
          originalName: file.originalname,
          fileName: zipRes.fileName,
          downloadUrl: dataUri || `/uploads/processed/${zipRes.fileName}`,
          dataUri,
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

const createZipArchive = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload files to zip.' });
    }

    const { zipName = 'cybercafe_archive.zip' } = req.body;
    const items = files.map(f => ({ path: f.path, name: f.originalname }));
    const result = await zipService.createZip(items, zipName.endsWith('.zip') ? zipName : `${zipName}.zip`);
    const dataUri = fileToDataUri(result.filePath, 'application/zip');

    res.json({
      success: true,
      message: 'ZIP archive created successfully.',
      downloadUrl: dataUri || `/uploads/processed/${result.fileName}`,
      dataUri,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const extractZipArchive = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a ZIP file to extract.' });
    }

    const result = await zipService.extractZip(file.path);
    res.json({
      success: true,
      message: 'ZIP extracted successfully.',
      files: result.files,
      count: result.count
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { compressFiles, createZipArchive, extractZipArchive };
