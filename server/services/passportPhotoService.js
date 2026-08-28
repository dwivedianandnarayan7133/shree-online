const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const { v4: uuidv4 } = require('uuid');
const { replacePortraitBackground } = require('./backgroundRemovalService');

const PASSPORT_SPECS = {
  'standard_35x45': { width: 398, height: 472, mmWidth: 35, mmHeight: 45, label: 'Standard Indian Passport (35 x 45 mm)' },
  'us_visa_2x2': { width: 580, height: 580, mmWidth: 51, mmHeight: 51, label: 'US Visa / 2x2 Inch (51 x 51 mm)' },
  'stamp_size': { width: 295, height: 354, mmWidth: 25, mmHeight: 30, label: 'Stamp Size (25 x 30 mm)' },
  'id_card_30x40': { width: 354, height: 472, mmWidth: 30, mmHeight: 40, label: 'ID Card (30 x 40 mm)' }
};

/**
 * Process single passport photo (framing, zoom, selective background replacement, subtle border)
 */
async function processSinglePassportPhoto(inputPath, options = {}) {
  const {
    spec = 'standard_35x45',
    zoom = 1.0,
    topOffset = 0.1,
    bgColor = 'original', // 'white', 'sky_blue', 'exam_blue', 'light_grey', 'original'
    addBorder = true,
    borderColor = '#cccccc',
    borderWidth = 2
  } = options;

  const targetSpec = PASSPORT_SPECS[spec] || PASSPORT_SPECS.standard_35x45;
  const metadata = await sharp(inputPath).metadata();

  const origW = metadata.width || 800;
  const origH = metadata.height || 1000;
  const targetAspect = targetSpec.width / targetSpec.height;

  let croppedBuf;

  try {
    // 1. Calculate base crop bounding box fitting in original image
    let baseW = origW;
    let baseH = Math.round(origW / targetAspect);

    if (baseH > origH) {
      baseH = origH;
      baseW = Math.round(origH * targetAspect);
    }

    // 2. Apply zoom safely (clamping so it never exceeds origW or origH)
    const effectiveZoom = Math.max(0.5, Number(zoom) || 1.0);
    let cropW = Math.round(baseW / effectiveZoom);
    let cropH = Math.round(baseH / effectiveZoom);

    if (cropW > origW) {
      cropW = origW;
      cropH = Math.round(origW / targetAspect);
    }
    if (cropH > origH) {
      cropH = origH;
      cropW = Math.round(origH * targetAspect);
    }

    // Final boundary checks
    cropW = Math.max(20, Math.min(origW, cropW));
    cropH = Math.max(20, Math.min(origH, cropH));

    // Calculate left & top ensuring [0, orig - crop]
    const maxLeft = Math.max(0, origW - cropW);
    const maxTop = Math.max(0, origH - cropH);
    const left = Math.max(0, Math.min(maxLeft, Math.round(maxLeft / 2)));
    const top = Math.max(0, Math.min(maxTop, Math.round(maxTop * Number(topOffset || 0.1))));

    croppedBuf = await sharp(inputPath)
      .extract({ left, top, width: cropW, height: cropH })
      .resize(targetSpec.width, targetSpec.height, { fit: 'cover' })
      .jpeg({ quality: 98 })
      .toBuffer();
  } catch (err) {
    croppedBuf = await sharp(inputPath)
      .resize(targetSpec.width, targetSpec.height, { fit: 'cover', position: 'top' })
      .jpeg({ quality: 98 })
      .toBuffer();
  }

  // 3. Perform Selective Background Replacement (Preserving face, skin tones & clothes)
  let processedBuf = croppedBuf;
  if (bgColor && bgColor !== 'original') {
    processedBuf = await replacePortraitBackground(croppedBuf, bgColor);
  }

  let pipeline = sharp(processedBuf);

  // 4. Add Outer Hairline Photo Border
  if (addBorder) {
    const borderSvg = Buffer.from(
      `<svg width="${targetSpec.width}" height="${targetSpec.height}">
        <rect x="0" y="0" width="${targetSpec.width}" height="${targetSpec.height}" 
          fill="none" stroke="${borderColor}" stroke-width="${borderWidth}" />
      </svg>`
    );
    pipeline = pipeline.composite([{ input: borderSvg, top: 0, left: 0 }]);
  }

  const outFilename = `passport-${Date.now()}-${uuidv4().substring(0, 6)}.jpg`;
  const outPath = path.join(UPLOAD_PATHS.PROCESSED, outFilename);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  await pipeline.jpeg({ quality: 96 }).toFile(outPath);

  return {
    filePath: outPath,
    fileName: outFilename,
    spec: targetSpec,
    width: targetSpec.width,
    height: targetSpec.height
  };
}

/**
 * Generate Multi-Photo Printable Sheet with Easy-Cut Padding & Guidelines
 * 6 photos per line, 7 lines (42 photos max on A4), with cutting padding gutter & corner guides
 */
async function generatePassportSheet(singlePhotoPath, options = {}) {
  const {
    quantity = 6, // Flexible count (1 to 42)
    paperType = 'A4', // 'A4' (6 photos/line, 7 lines = 42 total) or '4x6'
    spec = 'standard_35x45',
    includeCutLines = true,
    paddingGutter = 'standard' // 'compact', 'standard' (14px), 'wide' (20px)
  } = options;

  const targetSpec = PASSPORT_SPECS[spec] || PASSPORT_SPECS.standard_35x45;
  const count = Math.max(1, Math.min(42, Number(quantity) || 6));

  let sheetW = 2480; // A4 @ 300 DPI
  let sheetH = 3508;
  let cols = 6; // Exactly 6 photos per line
  let maxRows = 7; // Exactly 7 lines per sheet (6 x 7 = 42 photos)
  let photoW = 398;
  let photoH = 472;

  // Comfortable cutting padding between photos
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
    maxRows = 2;
    photoW = 560;
    photoH = 560;
    gapX = 20;
    gapY = 20;
  }

  // Calculate centered start positions on the paper
  const totalGridW = (cols * photoW) + ((cols - 1) * gapX);
  const startX = Math.max(15, Math.floor((sheetW - totalGridW) / 2));
  const startY = 40; // Top margin

  const composites = [];
  const singleBuf = await sharp(singlePhotoPath).resize(photoW, photoH).toBuffer();

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    // Precise padded alignment for easy straight-line scissor cutting
    const left = startX + (col * (photoW + gapX));
    const top = startY + (row * (photoH + gapY));

    composites.push({ input: singleBuf, top, left });

    // Cutting border & corner alignment marks for easy scissor slicing
    if (includeCutLines) {
      const cutMarkSvg = Buffer.from(
        `<svg width="${photoW + 8}" height="${photoH + 8}">
          <!-- Photo boundary dotted guide -->
          <rect x="4" y="4" width="${photoW}" height="${photoH}" 
            fill="none" stroke="#cccccc" stroke-width="1.2" stroke-dasharray="4,4" />
          <!-- Corner cutting ticks -->
          <path d="M 0 4 L 4 4 M 4 0 L 4 4 M ${photoW+4} 4 L ${photoW+8} 4 M ${photoW+4} 0 L ${photoW+4} 4 M 0 ${photoH+4} L 4 ${photoH+4} M 4 ${photoH+4} L 4 ${photoH+8} M ${photoW+4} ${photoH+4} L ${photoW+8} ${photoH+4} M ${photoW+4} ${photoH+4} L ${photoW+4} ${photoH+8}" 
            stroke="#999999" stroke-width="1.5" fill="none" />
        </svg>`
      );
      composites.push({
        input: cutMarkSvg,
        top: Math.max(0, top - 4),
        left: Math.max(0, left - 4)
      });
    }
  }

  const sheetFilename = `shree-passport-sheet-${count}x-${Date.now()}.jpg`;
  const sheetPath = path.join(UPLOAD_PATHS.PROCESSED, sheetFilename);
  fs.mkdirSync(path.dirname(sheetPath), { recursive: true });

  await sharp({
    create: {
      width: sheetW,
      height: sheetH,
      channels: 3,
      background: { r: 255, g: 255, b: 255 }
    }
  })
    .composite(composites)
    .jpeg({ quality: 98, chromaSubsampling: '4:4:4' })
    .toFile(sheetPath);

  // Generate printable PDF
  const pdfDoc = await PDFDocument.create();
  const pdfW = paperType === 'A4' ? 595.28 : 432;
  const pdfH = paperType === 'A4' ? 841.89 : 288;
  const page = pdfDoc.addPage([pdfW, pdfH]);

  const sheetBytes = fs.readFileSync(sheetPath);
  const pdfImage = await pdfDoc.embedJpg(sheetBytes);
  page.drawImage(pdfImage, {
    x: 0,
    y: 0,
    width: pdfW,
    height: pdfH
  });

  const pdfFilename = `shree-passport-sheet-${count}x-${Date.now()}.pdf`;
  const pdfPath = path.join(UPLOAD_PATHS.PROCESSED, pdfFilename);
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(pdfPath, pdfBytes);

  return {
    jpgPath: sheetPath,
    jpgName: sheetFilename,
    pdfPath: pdfPath,
    pdfName: pdfFilename,
    quantity: count,
    paperType,
    width: sheetW,
    height: sheetH
  };
}

module.exports = {
  PASSPORT_SPECS,
  processSinglePassportPhoto,
  generatePassportSheet
};
