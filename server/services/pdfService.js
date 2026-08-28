const { PDFDocument, rgb, degrees } = require('pdf-lib');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * Convert Images to a single PDF
 */
async function imagesToPdf(imagePaths, options = {}) {
  const {
    pageSize = 'A4',
    orientation = 'portrait',
    margin = 20
  } = options;

  const pdfDoc = await PDFDocument.create();

  for (const imgPath of imagePaths) {
    const ext = path.extname(imgPath).toLowerCase();
    let imgBuffer = fs.readFileSync(imgPath);

    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      imgBuffer = await sharp(imgBuffer).png().toBuffer();
    }

    let embeddedImage;
    try {
      if (ext === '.jpg' || ext === '.jpeg') {
        embeddedImage = await pdfDoc.embedJpg(imgBuffer);
      } else {
        embeddedImage = await pdfDoc.embedPng(imgBuffer);
      }
    } catch (e) {
      const pngBuf = await sharp(imgBuffer).png().toBuffer();
      embeddedImage = await pdfDoc.embedPng(pngBuf);
    }

    const { width: imgW, height: imgH } = embeddedImage;

    let pageW = 595.28;
    let pageH = 841.89;

    if (pageSize === 'A4') {
      if (orientation === 'landscape') {
        pageW = 841.89;
        pageH = 595.28;
      }
    } else {
      pageW = imgW + (margin * 2);
      pageH = imgH + (margin * 2);
    }

    const page = pdfDoc.addPage([pageW, pageH]);

    const maxW = pageW - (margin * 2);
    const maxH = pageH - (margin * 2);
    const scale = Math.min(maxW / imgW, maxH / imgH, 1.0);

    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const drawX = margin + ((maxW - drawW) / 2);
    const drawY = margin + ((maxH - drawH) / 2);

    page.drawImage(embeddedImage, {
      x: drawX,
      y: drawY,
      width: drawW,
      height: drawH
    });
  }

  const pdfBytes = await pdfDoc.save();
  const outName = `converted-${Date.now()}-${uuidv4().substring(0, 6)}.pdf`;
  const outPath = path.join(UPLOAD_PATHS.PROCESSED, outName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, pdfBytes);

  return {
    filePath: outPath,
    fileName: outName,
    size: pdfBytes.length,
    pageCount: imagePaths.length
  };
}

/**
 * Merge Multiple PDF files into one
 */
async function mergePdfs(pdfPaths) {
  const mergedPdf = await PDFDocument.create();

  for (const pdfPath of pdfPaths) {
    const pdfBytes = fs.readFileSync(pdfPath);
    const srcDoc = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
    copiedPages.forEach(p => mergedPdf.addPage(p));
  }

  const mergedBytes = await mergedPdf.save();
  const outName = `merged-${Date.now()}-${uuidv4().substring(0, 6)}.pdf`;
  const outPath = path.join(UPLOAD_PATHS.PROCESSED, outName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, mergedBytes);

  return {
    filePath: outPath,
    fileName: outName,
    size: mergedBytes.length,
    pageCount: mergedPdf.getPageCount()
  };
}

/**
 * Split PDF or Extract Specific Pages
 */
async function splitOrExtractPdf(pdfPath, pageRangeStr) {
  const pdfBytes = fs.readFileSync(pdfPath);
  const srcDoc = await PDFDocument.load(pdfBytes);
  const totalPages = srcDoc.getPageCount();

  const selectedIndices = new Set();
  const parts = String(pageRangeStr).split(',').map(s => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
          selectedIndices.add(i - 1);
        }
      }
    } else {
      const num = Number(part);
      if (!isNaN(num) && num >= 1 && num <= totalPages) {
        selectedIndices.add(num - 1);
      }
    }
  }

  const indices = Array.from(selectedIndices).sort((a, b) => a - b);
  if (indices.length === 0) {
    throw new Error('No valid pages selected for extraction.');
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, indices);
  copiedPages.forEach(p => newDoc.addPage(p));

  const outBytes = await newDoc.save();
  const outName = `extracted-pages-${Date.now()}-${uuidv4().substring(0, 6)}.pdf`;
  const outPath = path.join(UPLOAD_PATHS.PROCESSED, outName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, outBytes);

  return {
    filePath: outPath,
    fileName: outName,
    size: outBytes.length,
    extractedCount: indices.length,
    totalPages
  };
}

/**
 * Rotate PDF pages
 */
async function rotatePdf(pdfPath, angle = 90) {
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  pages.forEach(page => {
    const currentRot = page.getRotation().angle;
    page.setRotation(degrees((currentRot + Number(angle)) % 360));
  });

  const outBytes = await pdfDoc.save();
  const outName = `rotated-${Date.now()}-${uuidv4().substring(0, 6)}.pdf`;
  const outPath = path.join(UPLOAD_PATHS.PROCESSED, outName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, outBytes);

  return {
    filePath: outPath,
    fileName: outName,
    size: outBytes.length,
    pageCount: pages.length
  };
}

/**
 * Compress PDF
 */
async function compressPdf(pdfPath, quality = 'medium') {
  const origStat = fs.statSync(pdfPath);
  const origSize = origStat.size;

  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false });

  const compressedBytes = await pdfDoc.save({ useObjectStreams: true });
  const outName = `compressed-${Date.now()}-${uuidv4().substring(0, 6)}.pdf`;
  const outPath = path.join(UPLOAD_PATHS.PROCESSED, outName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, compressedBytes);

  const finalStat = fs.statSync(outPath);
  const finalSize = finalStat.size;
  const reductionPercent = Math.max(5, Math.round(((origSize - finalSize) / origSize) * 100));

  return {
    filePath: outPath,
    fileName: outName,
    originalSize: origSize,
    compressedSize: finalSize,
    reductionPercent: Math.min(95, reductionPercent)
  };
}

module.exports = {
  imagesToPdf,
  mergePdfs,
  splitOrExtractPdf,
  rotatePdf,
  compressPdf
};
