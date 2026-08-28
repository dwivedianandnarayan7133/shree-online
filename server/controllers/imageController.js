const path = require('path');
const passportPhotoService = require('../services/passportPhotoService');
const imageProcessingService = require('../services/imageProcessingService');
const { logAudit } = require('../utils/logger');

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

    res.json({
      success: true,
      message: 'Passport photo framed successfully.',
      downloadUrl: `/uploads/processed/${result.fileName}`,
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
      quantity = 5,
      paperType = 'A4',
      spec = 'standard_35x45',
      zoom = 1.0,
      bgColor = 'original',
      includeCutLines = 'true'
    } = req.body;

    // First frame the single photo
    const singleResult = await passportPhotoService.processSinglePassportPhoto(file.path, {
      spec,
      zoom: Number(zoom),
      bgColor,
      addBorder: true
    });

    // Then build the printable multi-photo sheet with strict row alignment
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

    const jpgUrl = `/uploads/processed/${sheetResult.jpgName}`;
    const pdfUrl = `/uploads/processed/${sheetResult.pdfName}`;

    res.json({
      success: true,
      message: `${quantity}x Passport photo print sheet generated successfully.`,
      singlePhotoUrl: `/uploads/processed/${singleResult.fileName}`,
      sheetJpgUrl: jpgUrl,
      sheetPdfUrl: pdfUrl,
      downloadUrlJpg: jpgUrl,
      downloadUrlPdf: pdfUrl,
      downloadUrl: jpgUrl,
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

    res.json({
      success: true,
      message: 'Document restored and enhanced.',
      downloadUrl: `/uploads/processed/${result.fileName}`,
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

    const { crop, invert = false, contrastBoost = 1.8 } = req.body;
    let cropObj = null;
    if (crop) {
      try { cropObj = typeof crop === 'string' ? JSON.parse(crop) : crop; } catch (e) {}
    }

    const result = await imageProcessingService.processSignature(file.path, {
      crop: cropObj,
      invert: invert === 'true' || invert === true,
      contrastBoost: Number(contrastBoost)
    });

    res.json({
      success: true,
      message: 'Signature processed and enhanced.',
      downloadUrl: `/uploads/processed/${result.fileName}`,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// General Image Transform (Resize, Crop, Format Convert)
const transformImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload an image.' });
    }

    const {
      width,
      height,
      fit = 'inside',
      rotation = 0,
      format = 'jpeg',
      quality = 85,
      crop
    } = req.body;

    let cropObj = null;
    if (crop) {
      try { cropObj = typeof crop === 'string' ? JSON.parse(crop) : crop; } catch (e) {}
    }

    const result = await imageProcessingService.transformImage(file.path, {
      width: width ? Number(width) : null,
      height: height ? Number(height) : null,
      fit,
      rotation: Number(rotation),
      format,
      quality: Number(quality),
      crop: cropObj
    });

    res.json({
      success: true,
      message: 'Image transformed successfully.',
      downloadUrl: `/uploads/processed/${result.fileName}`,
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
