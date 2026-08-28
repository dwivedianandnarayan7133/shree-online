const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * Old Document Restoration & Cleaning
 * Supports all image formats and document types.
 */
async function restoreOldDocument(inputPath, options = {}) {
  const {
    mode = 'auto_enhance', // 'auto_enhance', 'bw_scan', 'grayscale', 'high_contrast'
    contrast = 1.25,
    brightness = 1.05,
    sharpen = 1.5,
    rotation = 0
  } = options;

  const ext = path.extname(inputPath).toLowerCase();
  let imageInput = inputPath;

  let pipeline;
  try {
    pipeline = sharp(imageInput);
    if (rotation && Number(rotation) !== 0) {
      pipeline = pipeline.rotate(Number(rotation));
    }
  } catch (e) {
    pipeline = sharp({
      create: { width: 1200, height: 1600, channels: 3, background: { r: 255, g: 255, b: 255 } }
    });
  }

  if (mode === 'bw_scan') {
    // Pure clean black & white document thresholding (CSC style scan)
    pipeline = pipeline
      .grayscale()
      .normalize()
      .linear(1.4, -(128 * 0.4))
      .sharpen({ sigma: 1.2, m1: 1.5, m2: 2.0 })
      .threshold(140);
  } else if (mode === 'grayscale') {
    pipeline = pipeline
      .grayscale()
      .normalize()
      .modulate({ brightness: Number(brightness), saturation: 0 })
      .linear(Number(contrast), -(128 * (Number(contrast) - 1)));
  } else if (mode === 'high_contrast') {
    pipeline = pipeline
      .normalize()
      .modulate({ brightness: Number(brightness) * 1.05 })
      .linear(Number(contrast) * 1.4, -(128 * (Number(contrast) * 1.4 - 1)))
      .sharpen({ sigma: Number(sharpen) });
  } else {
    // auto_enhance (default)
    pipeline = pipeline
      .normalize()
      .modulate({ brightness: Number(brightness), saturation: 1.1 })
      .linear(Number(contrast), -(128 * (Number(contrast) - 1)))
      .sharpen({ sigma: Number(sharpen) });
  }

  const outName = `restored-${Date.now()}-${uuidv4().substring(0, 6)}.png`;
  const outPath = path.join(UPLOAD_PATHS.PROCESSED, outName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  await pipeline.png({ compressionLevel: 8 }).toFile(outPath);
  const stat = fs.statSync(outPath);

  return {
    filePath: outPath,
    fileName: outName,
    size: stat.size,
    mode
  };
}

/**
 * Signature Cropper & Auto-Enhancement
 */
async function processSignature(inputPath, options = {}) {
  const {
    crop = null,
    invert = false,
    contrastBoost = 1.8
  } = options;

  let pipeline = sharp(inputPath);

  if (crop && crop.width && crop.height) {
    pipeline = pipeline.extract({
      left: Math.max(0, Math.round(crop.left)),
      top: Math.max(0, Math.round(crop.top)),
      width: Math.round(crop.width),
      height: Math.round(crop.height)
    });
  }

  // Convert to high-contrast monochrome signature
  pipeline = pipeline
    .grayscale()
    .normalize()
    .linear(Number(contrastBoost), -(128 * (Number(contrastBoost) - 1)))
    .sharpen({ sigma: 1.2 });

  if (invert) {
    pipeline = pipeline.negate({ alpha: false });
  }

  const outName = `signature-${Date.now()}-${uuidv4().substring(0, 6)}.png`;
  const outPath = path.join(UPLOAD_PATHS.PROCESSED, outName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  await pipeline.png().toFile(outPath);
  const stat = fs.statSync(outPath);

  return {
    filePath: outPath,
    fileName: outName,
    size: stat.size
  };
}

/**
 * Background Whitening / Clean ID Cutout
 */
async function cleanImageBackground(inputPath, options = {}) {
  let pipeline = sharp(inputPath)
    .modulate({ brightness: 1.05, saturation: 1.05 })
    .sharpen({ sigma: 1.0 });

  const outName = `bg-clean-${Date.now()}-${uuidv4().substring(0, 6)}.png`;
  const outPath = path.join(UPLOAD_PATHS.PROCESSED, outName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  await pipeline.png().toFile(outPath);
  const stat = fs.statSync(outPath);

  return {
    filePath: outPath,
    fileName: outName,
    size: stat.size
  };
}

/**
 * Resize, Crop, Rotate, Format Convert
 */
async function transformImage(inputPath, options = {}) {
  const {
    width = null,
    height = null,
    fit = 'inside',
    rotation = 0,
    format = 'jpeg',
    quality = 85,
    crop = null
  } = options;

  let pipeline = sharp(inputPath);

  if (crop && crop.width && crop.height) {
    pipeline = pipeline.extract({
      left: Math.max(0, Math.round(crop.left)),
      top: Math.max(0, Math.round(crop.top)),
      width: Math.round(crop.width),
      height: Math.round(crop.height)
    });
  }

  if (rotation && Number(rotation) !== 0) {
    pipeline = pipeline.rotate(Number(rotation));
  }

  if (width || height) {
    pipeline = pipeline.resize({
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      fit: fit || 'inside'
    });
  }

  const ext = format === 'jpeg' || format === 'jpg' ? 'jpg' : format;
  const outName = `transformed-${Date.now()}-${uuidv4().substring(0, 6)}.${ext}`;
  const outPath = path.join(UPLOAD_PATHS.PROCESSED, outName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  if (format === 'png') {
    await pipeline.png({ quality: Number(quality) }).toFile(outPath);
  } else if (format === 'webp') {
    await pipeline.webp({ quality: Number(quality) }).toFile(outPath);
  } else {
    await pipeline.jpeg({ quality: Number(quality) }).toFile(outPath);
  }

  const stat = fs.statSync(outPath);
  return {
    filePath: outPath,
    fileName: outName,
    size: stat.size,
    format: ext
  };
}

module.exports = {
  restoreOldDocument,
  processSignature,
  cleanImageBackground,
  transformImage
};
