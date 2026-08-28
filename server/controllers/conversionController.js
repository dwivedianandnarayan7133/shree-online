const ocrService = require('../services/ocrService');
const docxService = require('../services/docxService');
const excelService = require('../services/excelService');
const { logAudit } = require('../utils/logger');

// Run OCR on uploaded document/image
const extractOcr = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload an image or document for OCR.' });
    }

    const { lang = 'eng' } = req.body;
    const result = await ocrService.performOcr(file.path, { lang });

    await logAudit({
      action: 'OCR_EXTRACTION',
      user: req.user ? req.user.name : 'Anonymous',
      details: { lang, lineCount: result.lineCount, words: result.words }
    });

    res.json({
      success: true,
      message: 'OCR extraction completed.',
      result: {
        text: result.text,
        confidence: result.confidence,
        lineCount: result.lineCount,
        words: result.words,
        detectedTable: result.detectedTable,
        hasTable: Boolean(result.detectedTable && result.detectedTable.length > 0), format: result.format
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Export to .docx Word
const exportToDocx = async (req, res) => {
  try {
    const { text, title = 'Converted Document', tableData = null } = req.body;
    if (!text && (!tableData || tableData.length === 0)) {
      return res.status(400).json({ success: false, message: 'Text or table data is required.' });
    }

    const result = await docxService.generateDocxFromText(text || '', {
      title,
      tableData
    });

    res.json({
      success: true,
      message: 'Word document created.',
      downloadUrl: `/uploads/processed/${result.fileName}`,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Export to .xlsx Excel
const exportToExcel = async (req, res) => {
  try {
    const { tableRows, sheetName = 'Converted Data' } = req.body;
    if (!tableRows || !Array.isArray(tableRows) || tableRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Valid table rows array is required.' });
    }

    const result = await excelService.generateExcelFromTable(tableRows, { sheetName });

    res.json({
      success: true,
      message: 'Excel spreadsheet created.',
      downloadUrl: `/uploads/processed/${result.fileName}`,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  extractOcr,
  exportToDocx,
  exportToExcel
};
