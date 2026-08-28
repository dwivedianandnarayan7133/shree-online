const fs = require('fs');
const path = require('path');
const { UPLOAD_PATHS } = require('../config/constants');
const pdfService = require('../services/pdfService');
const { logAudit } = require('../utils/logger');

function fileToDataUri(filePath, mimeType = 'application/pdf') {
  try {
    if (fs.existsSync(filePath)) {
      const buf = fs.readFileSync(filePath);
      return `data:${mimeType};base64,${buf.toString('base64')}`;
    }
  } catch (e) {}
  return null;
}

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

    const dataUri = fileToDataUri(result.filePath, 'application/pdf');

    res.json({
      success: true,
      message: 'Images converted to PDF successfully.',
      downloadUrl: dataUri || `/uploads/processed/${result.fileName}`,
      dataUri,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

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

    const dataUri = fileToDataUri(result.filePath, 'application/pdf');

    res.json({
      success: true,
      message: 'PDF files merged successfully.',
      downloadUrl: dataUri || `/uploads/processed/${result.fileName}`,
      dataUri,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

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

    const dataUri = fileToDataUri(result.filePath, 'application/pdf');

    res.json({
      success: true,
      message: 'PDF pages extracted successfully.',
      downloadUrl: dataUri || `/uploads/processed/${result.fileName}`,
      dataUri,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const rotatePdf = async (req, res) => {
  try {
    const file = req.file;
    const { rotation = 90 } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });
    }

    const result = await pdfService.rotatePdf(file.path, Number(rotation));

    const dataUri = fileToDataUri(result.filePath, 'application/pdf');

    res.json({
      success: true,
      message: 'PDF rotated successfully.',
      downloadUrl: dataUri || `/uploads/processed/${result.fileName}`,
      dataUri,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const compressPdf = async (req, res) => {
  try {
    const file = req.file;
    const { quality = 'medium' } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file to compress.' });
    }

    const result = await pdfService.compressPdf(file.path, quality);
    const dataUri = fileToDataUri(result.filePath, 'application/pdf');

    res.json({
      success: true,
      message: 'PDF compressed successfully.',
      downloadUrl: dataUri || `/uploads/processed/${result.fileName}`,
      dataUri,
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
