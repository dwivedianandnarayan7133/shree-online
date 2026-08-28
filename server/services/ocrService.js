const { UPLOAD_PATHS } = require('../config/constants');
﻿const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');
const ExcelJS = require('exceljs');

/**
 * Universal Multi-Format OCR & Document Extractor
 * Seamlessly extracts text and tabular structures from PDF, DOCX, XLSX, CSV, TXT, and all Image formats.
 */
async function performOcr(inputPath, options = {}) {
  const { lang = 'eng', enhanceFirst = true } = options;
  const ext = path.extname(inputPath).toLowerCase();

  // 1. PDF File Extraction (.pdf)
  if (ext === '.pdf') {
    let parser = null;
    try {
      const dataBuffer = fs.readFileSync(inputPath);
      parser = new PDFParse({ data: dataBuffer });
      const textResult = await parser.getText();
      const rawText = (textResult.text || '').trim();

      if (rawText.length > 0) {
        // Strip page footer annotations like "-- 1 of 1 --"
        const cleanText = rawText.replace(/--\s*\d+\s*of\s*\d+\s*--/g, '').trim();
        const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
        const tableRows = [];

        lines.forEach(line => {
          const cells = line.split(/\s{2,}|\t|\|/).map(c => c.trim()).filter(Boolean);
          if (cells.length > 1) {
            tableRows.push(cells);
          } else if (line.includes(',') && line.split(',').length >= 3) {
            tableRows.push(line.split(',').map(c => c.trim()));
          }
        });

        await parser.destroy();

        return {
          text: cleanText,
          confidence: 99,
          lineCount: lines.length,
          detectedTable: tableRows.length >= 2 ? tableRows : null,
          words: cleanText.split(/\s+/).filter(Boolean).length,
          pages: textResult.total || 1,
          format: 'PDF Document (.pdf)'
        };
      }
    } catch (err) {
      console.warn('PDF parser note:', err.message);
    } finally {
      if (parser) {
        try { await parser.destroy(); } catch (e) {}
      }
    }
  }

  // 2. Word Document (.docx / .doc)
  if (ext === '.docx' || ext === '.doc') {
    try {
      const docxResult = await mammoth.extractRawText({ path: inputPath });
      const fullText = (docxResult.value || '').trim();
      const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
      const tableRows = [];

      lines.forEach(line => {
        const cells = line.split(/\s{2,}|\t|\|/).map(c => c.trim()).filter(Boolean);
        if (cells.length > 1) tableRows.push(cells);
      });

      return {
        text: fullText,
        confidence: 100,
        lineCount: lines.length,
        detectedTable: tableRows.length >= 2 ? tableRows : null,
        words: fullText.split(/\s+/).filter(Boolean).length,
        format: 'Word Document (.docx)'
      };
    } catch (err) {
      console.warn('Docx extract fallback:', err.message);
    }
  }

  // 3. Excel Spreadsheet (.xlsx / .xls / .csv)
  if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
    try {
      const workbook = new ExcelJS.Workbook();
      if (ext === '.csv') {
        await workbook.csv.readFile(inputPath);
      } else {
        await workbook.xlsx.readFile(inputPath);
      }

      const tableRows = [];
      const textLines = [];

      workbook.eachSheet((worksheet) => {
        worksheet.eachRow((row) => {
          const rowValues = Array.isArray(row.values) ? row.values.slice(1) : [];
          const cleanCells = rowValues.map(v => (v !== null && v !== undefined ? String(v).trim() : ''));
          if (cleanCells.some(c => c !== '')) {
            tableRows.push(cleanCells);
            textLines.push(cleanCells.join('\t'));
          }
        });
      });

      const fullText = textLines.join('\n');
      return {
        text: fullText,
        confidence: 100,
        lineCount: textLines.length,
        detectedTable: tableRows.length > 0 ? tableRows : null,
        words: fullText.split(/\s+/).filter(Boolean).length,
        format: 'Excel Spreadsheet'
      };
    } catch (err) {
      console.warn('Excel parse fallback:', err.message);
    }
  }

  // 4. Plain Text (.txt / .rtf / .md / .json)
  if (ext === '.txt' || ext === '.md' || ext === '.json' || ext === '.rtf') {
    try {
      const fullText = fs.readFileSync(inputPath, 'utf8').trim();
      const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
      return {
        text: fullText,
        confidence: 100,
        lineCount: lines.length,
        detectedTable: null,
        words: fullText.split(/\s+/).filter(Boolean).length,
        format: 'Text File'
      };
    } catch (err) {
      console.warn('Text file read fallback:', err.message);
    }
  }

  // 5. Image OCR Processing (.jpg, .jpeg, .png, .webp, .bmp, .tiff, .jfif, .heic, etc.)
  let procPath = inputPath;
  let tempClean = null;

  try {
    tempClean = path.join(UPLOAD_PATHS.TEMP, `ocr-prep-${Date.now()}.png`);
    fs.mkdirSync(path.dirname(tempClean), { recursive: true });

    await sharp(inputPath)
      .grayscale()
      .normalize()
      .sharpen()
      .png()
      .toFile(tempClean);
    procPath = tempClean;
  } catch (prepErr) {
    // If sharp fails to preprocess (e.g. non-standard header), pass original directly to Tesseract
    procPath = inputPath;
  }

  try {
    const result = await Tesseract.recognize(procPath, lang, {
      logger: () => {}
    });

    const fullText = (result.data.text || '').trim();
    const confidence = Math.round(result.data.confidence || 85);
    const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
    const tableRows = [];

    lines.forEach(line => {
      const cells = line.split(/\s{2,}|\t|\|/).map(c => c.trim()).filter(Boolean);
      if (cells.length > 1) {
        tableRows.push(cells);
      } else if (line.includes(',') && line.split(',').length >= 3) {
        tableRows.push(line.split(',').map(c => c.trim()));
      }
    });

    if (tempClean && fs.existsSync(tempClean)) {
      try { fs.unlinkSync(tempClean); } catch (e) {}
    }

    return {
      text: fullText,
      confidence,
      lineCount: lines.length,
      detectedTable: tableRows.length >= 2 ? tableRows : null,
      words: result.data.words ? result.data.words.length : fullText.split(/\s+/).filter(Boolean).length,
      format: 'Scanned Document Image'
    };
  } catch (err) {
    if (tempClean && fs.existsSync(tempClean)) {
      try { fs.unlinkSync(tempClean); } catch (e) {}
    }
    throw new Error(`Document extraction failed: ${err.message}`);
  }
}

module.exports = { performOcr };
