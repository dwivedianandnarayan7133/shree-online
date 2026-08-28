import { jsPDF } from 'jspdf';

/**
 * Load a File or Blob into an HTMLImageElement
 */
export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(new Error('Failed to load image file.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Error reading file.'));
    reader.readAsDataURL(file);
  });
}

const PASSPORT_SPECS = {
  'standard_35x45': { width: 398, height: 472, mmWidth: 35, mmHeight: 45, label: 'Standard Indian Passport (35 x 45 mm)' },
  'us_visa_2x2': { width: 580, height: 580, mmWidth: 51, mmHeight: 51, label: 'US Visa / 2x2 Inch (51 x 51 mm)' },
  'stamp_size': { width: 295, height: 354, mmWidth: 25, mmHeight: 30, label: 'Stamp Size (25 x 30 mm)' },
  'id_card_30x40': { width: 354, height: 472, mmWidth: 30, mmHeight: 40, label: 'ID Card (30 x 40 mm)' }
};

/**
 * Process Single Framed Passport Photo Client-Side
 */
export async function processSinglePassportPhotoClient(file, options = {}) {
  const {
    spec = 'standard_35x45',
    zoom = 1.0,
    topOffset = 0.1,
    bgColor = 'original',
    addBorder = true,
    borderColor = '#cccccc',
    borderWidth = 2
  } = options;

  const targetSpec = PASSPORT_SPECS[spec] || PASSPORT_SPECS.standard_35x45;
  const img = await loadImageFromFile(file);

  const origW = img.width || 800;
  const origH = img.height || 1000;
  const targetAspect = targetSpec.width / targetSpec.height;

  let baseW = origW;
  let baseH = Math.round(origW / targetAspect);

  if (baseH > origH) {
    baseH = origH;
    baseW = Math.round(origH * targetAspect);
  }

  const effectiveZoom = Math.max(0.5, Number(zoom) || 1.0);
  let cropW = Math.round(baseW / effectiveZoom);
  let cropH = Math.round(baseH / effectiveZoom);

  if (cropW > origW) cropW = origW;
  if (cropH > origH) cropH = origH;

  const cropX = Math.max(0, Math.round((origW - cropW) / 2));
  const cropY = Math.max(0, Math.min(origH - cropH, Math.round((origH - cropH) * Number(topOffset))));

  const canvas = document.createElement('canvas');
  canvas.width = targetSpec.width;
  canvas.height = targetSpec.height;
  const ctx = canvas.getContext('2d');

  // Background fill
  if (bgColor === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (bgColor === 'sky_blue') {
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (bgColor === 'exam_blue') {
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (bgColor === 'light_grey') {
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw cropped photo
  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetSpec.width, targetSpec.height);

  // Subtle border
  if (addBorder) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }

  const dataUri = canvas.toDataURL('image/jpeg', 0.96);
  return {
    dataUri,
    canvas,
    spec: targetSpec,
    width: targetSpec.width,
    height: targetSpec.height
  };
}

/**
 * Generate Printable Passport Photo Sheet (A4 & 4x6) Client-Side with 100% Perfection
 */
export async function generatePassportSheetClient(file, options = {}) {
  const {
    quantity = 6,
    paperType = 'A4',
    spec = 'standard_35x45',
    zoom = 1.0,
    bgColor = 'original',
    includeCutLines = true,
    paddingGutter = 'standard'
  } = options;

  // 1. Generate Single Photo
  const single = await processSinglePassportPhotoClient(file, { spec, zoom, bgColor, addBorder: true });
  const singleImg = await loadImageFromFile(await (await fetch(single.dataUri)).blob());

  const count = Math.max(1, Math.min(42, Number(quantity) || 6));

  let sheetW = 2480; // A4 @ 300 DPI
  let sheetH = 3508;
  let cols = 6; // 6 photos per line on A4
  let photoW = 398;
  let photoH = 472;
  let gapX = 14;
  let gapY = 16;

  if (paddingGutter === 'wide') {
    photoW = 390;
    photoH = 462;
    gapX = 20;
    gapY = 22;
  } else if (paddingGutter === 'compact') {
    photoW = 405;
    photoH = 480;
    gapX = 8;
    gapY = 10;
  }

  if (paperType === '4x6') {
    sheetW = 1800; // 4x6 @ 300 DPI
    sheetH = 1200;
    cols = 3;
    photoW = 560;
    photoH = 560;
    gapX = 20;
    gapY = 20;
  }

  const sheetCanvas = document.createElement('canvas');
  sheetCanvas.width = sheetW;
  sheetCanvas.height = sheetH;
  const ctx = sheetCanvas.getContext('2d');

  // White clean sheet background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, sheetW, sheetH);

  const totalGridW = (cols * photoW) + ((cols - 1) * gapX);
  const startX = Math.max(15, Math.floor((sheetW - totalGridW) / 2));
  const startY = 40;

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    const left = startX + (col * (photoW + gapX));
    const top = startY + (row * (photoH + gapY));

    ctx.drawImage(singleImg, left, top, photoW, photoH);

    if (includeCutLines) {
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(left, top, photoW, photoH);
      ctx.setLineDash([]); // Reset line dash

      // Corner cutting ticks
      ctx.strokeStyle = '#999999';
      ctx.lineWidth = 1.5;
      const tick = 6;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(left - tick, top); ctx.lineTo(left, top); ctx.lineTo(left, top - tick);
      // Top-right
      ctx.moveTo(left + photoW + tick, top); ctx.lineTo(left + photoW, top); ctx.lineTo(left + photoW, top - tick);
      // Bottom-left
      ctx.moveTo(left - tick, top + photoH); ctx.lineTo(left, top + photoH); ctx.lineTo(left, top + photoH + tick);
      // Bottom-right
      ctx.moveTo(left + photoW + tick, top + photoH); ctx.lineTo(left + photoW, top + photoH); ctx.lineTo(left + photoW, top + photoH + tick);
      ctx.stroke();
    }
  }

  const sheetJpgUrl = sheetCanvas.toDataURL('image/jpeg', 0.98);

  // Generate printable PDF using jsPDF
  const orientation = paperType === 'A4' ? 'p' : 'l';
  const pdfFormat = paperType === 'A4' ? 'a4' : [101.6, 152.4];
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pdfFormat
  });

  const pdfW = orientation === 'p' ? 210 : 297;
  const pdfH = orientation === 'p' ? 297 : 210;

  doc.addImage(sheetJpgUrl, 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST');
  const sheetPdfUrl = doc.output('datauristring');

  return {
    success: true,
    message: `${count}x Passport photo print sheet generated successfully.`,
    singlePhotoUrl: single.dataUri,
    sheetJpgUrl,
    sheetPdfUrl,
    downloadUrlJpg: sheetJpgUrl,
    downloadUrlPdf: sheetPdfUrl,
    downloadUrl: sheetJpgUrl,
    result: {
      jpgName: `shree-passport-${count}x-${Date.now()}.jpg`,
      pdfName: `shree-passport-${count}x-${Date.now()}.pdf`,
      quantity: count,
      paperType
    }
  };
}

/**
 * Signature Cropper & B&W High-Contrast Thresholding Client-Side
 */
export async function processSignatureClient(file, options = {}) {
  const { contrastBoost = 1.8, invert = false } = options;
  const img = await loadImageFromFile(file);

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  const boost = Number(contrastBoost) || 1.8;

  for (let i = 0; i < data.length; i += 4) {
    // Convert to grayscale
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    // Contrast expansion
    let val = Math.round(((gray - 128) * boost) + 128);
    val = Math.max(0, Math.min(255, val));

    // Sharp thresholding
    if (val > 165) val = 255;
    else if (val < 110) val = 0;

    if (invert) val = 255 - val;

    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }

  ctx.putImageData(imgData, 0, 0);
  const dataUri = canvas.toDataURL('image/png');

  return {
    success: true,
    message: 'Signature processed and enhanced successfully.',
    downloadUrl: dataUri,
    dataUri,
    result: {
      fileName: `signature-${Date.now()}.png`
    }
  };
}

/**
 * Restore Old Document Client-Side
 */
export async function restoreOldDocumentClient(file, options = {}) {
  const { mode = 'auto_enhance', contrast = 1.25, brightness = 1.05 } = options;
  const img = await loadImageFromFile(file);

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  const cont = Number(contrast) || 1.25;
  const brt = Number(brightness) || 1.05;

  for (let i = 0; i < data.length; i += 4) {
    if (mode === 'bw_scan') {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const val = gray > 140 ? 255 : 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    } else {
      for (let c = 0; c < 3; c++) {
        let val = data[i + c] * brt;
        val = ((val - 128) * cont) + 128;
        data[i + c] = Math.max(0, Math.min(255, Math.round(val)));
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const dataUri = canvas.toDataURL('image/png');

  return {
    success: true,
    message: 'Document restored and enhanced.',
    downloadUrl: dataUri,
    dataUri,
    result: {
      fileName: `restored-${Date.now()}.png`
    }
  };
}

/**
 * Convert Images to PDF Client-Side
 */
export async function convertImagesToPdfClient(files) {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  for (let i = 0; i < files.length; i++) {
    if (i > 0) doc.addPage();
    const img = await loadImageFromFile(files[i]);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const dataUri = canvas.toDataURL('image/jpeg', 0.9);
    doc.addImage(dataUri, 'JPEG', 10, 10, 190, 277, undefined, 'FAST');
  }

  const pdfDataUri = doc.output('datauristring');
  return {
    success: true,
    message: 'Images converted to PDF successfully.',
    downloadUrl: pdfDataUri,
    dataUri: pdfDataUri,
    result: {
      fileName: `shree-document-${Date.now()}.pdf`
    }
  };
}
