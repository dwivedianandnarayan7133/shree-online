const fs = require('fs');
const path = require('path');
const { UPLOAD_PATHS } = require('../config/constants');
const passportPhotoService = require('../services/passportPhotoService');
const imageProcessingService = require('../services/imageProcessingService');
const { logAudit } = require('../utils/logger');

// Helper to safely read file to base64 Data URI
function fileToDataUri(filePath, mimeType = 'image/jpeg') {
  try {
    if (fs.existsSync(filePath)) {
      const buf = fs.readFileSync(filePath);
      return `data:${mimeType};base64,${buf.toString('base64')}`;
    }
  } catch (e) {
    console.warn('fileToDataUri notice:', e.message);
  }
  return null;
}

// Generate single cropped passport photo
const generateSinglePassportPhoto = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a photo.' });
    }

    const {
      spec = 'standard_35x45',
      zoom = 1.0,
      topOffset = 0.1,
      bgColor = 'original',
      addBorder = 'true',
      borderWidth = 4
    } = req.body;

    const result = await passportPhotoService.processSinglePassportPhoto(file.path, {
      spec,
      zoom: Number(zoom),
      topOffset: Number(topOffset),
      bgColor,
      addBorder: addBorder === 'true' || addBorder === true,
      borderWidth: Number(borderWidth)
    });

    const dataUri = fileToDataUri(result.filePath, 'image/jpeg');
    const staticUrl = `/uploads/processed/${result.fileName}`;

    res.json({
      success: true,
      message: 'Passport photo framed successfully.',
      downloadUrl: dataUri || staticUrl,
      staticUrl,
      dataUri,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Generate printable Passport Photo Sheet (A4 & 4x6 aligned rows)
const generatePassportSheet = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a photo.' });
    }

    const {
      quantity = 6,
      paperType = 'A4',
      spec = 'standard_35x45',
      zoom = 1.0,
      bgColor = 'original',
      includeCutLines = 'true'
    } = req.body;

    // 1. Process single photo
    const singleResult = await passportPhotoService.processSinglePassportPhoto(file.path, {
      spec,
      zoom: Number(zoom),
      bgColor,
      addBorder: true
    });

    // 2. Generate printable sheet
    const sheetResult = await passportPhotoService.generatePassportSheet(singleResult.filePath, {
      quantity: Number(quantity),
      paperType,
      spec,
      includeCutLines: includeCutLines === 'true' || includeCutLines === true
    });

    await logAudit({
      action: 'PASSPORT_SHEET_GENERATED',
      user: req.user ? req.user.name : 'Anonymous',
      details: { quantity, paperType, spec }
    });

    const singleDataUri = fileToDataUri(singleResult.filePath, 'image/jpeg');
    const sheetJpgDataUri = fileToDataUri(sheetResult.jpgPath, 'image/jpeg');
    const sheetPdfDataUri = fileToDataUri(sheetResult.pdfPath, 'application/pdf');

    const staticJpg = `/uploads/processed/${sheetResult.jpgName}`;
    const staticPdf = `/uploads/processed/${sheetResult.pdfName}`;

    res.json({
      success: true,
      message: `${quantity}x Passport photo print sheet generated successfully.`,
      singlePhotoUrl: singleDataUri || `/uploads/processed/${singleResult.fileName}`,
      sheetJpgUrl: sheetJpgDataUri || staticJpg,
      sheetPdfUrl: sheetPdfDataUri || staticPdf,
      downloadUrlJpg: sheetJpgDataUri || staticJpg,
      downloadUrlPdf: sheetPdfDataUri || staticPdf,
      downloadUrl: sheetJpgDataUri || staticJpg,
      result: sheetResult
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Restore old document
const restoreOldDocument = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a document image.' });
    }

    const {
      mode = 'auto_enhance',
      contrast = 1.25,
      brightness = 1.05,
      sharpen = 1.5,
      rotation = 0
    } = req.body;

    const result = await imageProcessingService.restoreOldDocument(file.path, {
      mode,
      contrast: Number(contrast),
      brightness: Number(brightness),
      sharpen: Number(sharpen),
      rotation: Number(rotation)
    });

    const dataUri = fileToDataUri(result.filePath, 'image/png');
    const staticUrl = `/uploads/processed/${result.fileName}`;

    res.json({
      success: true,
      message: 'Document restored and enhanced.',
      downloadUrl: dataUri || staticUrl,
      staticUrl,
      dataUri,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Process / Crop Signature
const processSignature = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a signature image.' });
    }

    const { contrastBoost = 1.8, invert = 'false' } = req.body;
    const result = await imageProcessingService.processSignature(file.path, {
      contrastBoost: Number(contrastBoost),
      invert: invert === 'true' || invert === true
    });

    const dataUri = fileToDataUri(result.filePath, 'image/png');
    const staticUrl = `/uploads/processed/${result.fileName}`;

    res.json({
      success: true,
      message: 'Signature processed and enhanced.',
      downloadUrl: dataUri || staticUrl,
      staticUrl,
      dataUri,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// General Image Conversion & Resize
const transformImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload an image.' });
    }

    const { width, height, format = 'jpeg', quality = 85 } = req.body;
    const result = await imageProcessingService.convertFormatAndResize(file.path, {
      width: width ? Number(width) : null,
      height: height ? Number(height) : null,
      format,
      quality: Number(quality)
    });

    const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
    const dataUri = fileToDataUri(result.filePath, mime);
    const staticUrl = `/uploads/processed/${result.fileName}`;

    res.json({
      success: true,
      message: 'Image resized and converted.',
      downloadUrl: dataUri || staticUrl,
      staticUrl,
      dataUri,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  generateSinglePassportPhoto,
  generatePassportSheet,
  restoreOldDocument,
  processSignature,
  transformImage
};
