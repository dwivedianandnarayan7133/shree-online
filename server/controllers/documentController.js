const path = require('path');
const fs = require('fs');
const pdfService = require('../services/pdfService');
const { logAudit } = require('../utils/logger');

// Convert Images to PDF
const convertImagesToPdf = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload one or more images.' });
    }

    const { pageSize = 'A4', orientation = 'portrait', margin = 20 } = req.body;
    const imagePaths = files.map(f => f.path);

    const result = await pdfService.imagesToPdf(imagePaths, {
      pageSize,
      orientation,
      margin: Number(margin)
    });

    await logAudit({
      action: 'DOC_IMAGES_TO_PDF',
      user: req.user ? req.user.name : 'Anonymous',
      details: { imageCount: files.length, outSize: result.size }
    });

    res.json({
      success: true,
      message: 'Images converted to PDF successfully.',
      downloadUrl: `/uploads/processed/${result.fileName}`,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Merge Multiple PDFs
const mergePdfs = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length < 2) {
      return res.status(400).json({ success: false, message: 'Please upload at least 2 PDF files to merge.' });
    }

    const pdfPaths = files.map(f => f.path);
    const result = await pdfService.mergePdfs(pdfPaths);

    await logAudit({
      action: 'DOC_MERGE_PDFS',
      user: req.user ? req.user.name : 'Anonymous',
      details: { fileCount: files.length, pageCount: result.pageCount }
    });

    res.json({
      success: true,
      message: 'PDF files merged successfully.',
      downloadUrl: `/uploads/processed/${result.fileName}`,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Split or Extract Pages from PDF
const splitOrExtractPdf = async (req, res) => {
  try {
    const file = req.file;
    const { pageRange = '1' } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });
    }

    const result = await pdfService.splitOrExtractPdf(file.path, pageRange);

    await logAudit({
      action: 'DOC_SPLIT_PDF',
      user: req.user ? req.user.name : 'Anonymous',
      details: { pageRange, extractedCount: result.extractedCount }
    });

    res.json({
      success: true,
      message: 'PDF pages extracted successfully.',
      downloadUrl: `/uploads/processed/${result.fileName}`,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Rotate PDF
const rotatePdf = async (req, res) => {
  try {
    const file = req.file;
    const { angle = 90 } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });
    }

    const result = await pdfService.rotatePdf(file.path, angle);

    res.json({
      success: true,
      message: 'PDF rotated successfully.',
      downloadUrl: `/uploads/processed/${result.fileName}`,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Compress PDF
const compressPdf = async (req, res) => {
  try {
    const file = req.file;
    const { quality = 'medium' } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });
    }

    const result = await pdfService.compressPdf(file.path, quality);

    res.json({
      success: true,
      message: 'PDF compressed successfully.',
      downloadUrl: `/uploads/processed/${result.fileName}`,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  convertImagesToPdf,
  mergePdfs,
  splitOrExtractPdf,
  rotatePdf,
  compressPdf
};
