const sharp = require('sharp');

// Official Indian Exam & CSC Standard Background Presets
const BACKGROUND_PRESETS = {
  white: { r: 255, g: 255, b: 255 },
  sky_blue: { r: 160, g: 206, b: 242 }, // Standard SSC / NTA / UPSC Passport Blue
  exam_blue: { r: 135, g: 188, b: 236 }, // Vivid Official Blue
  light_grey: { r: 225, g: 228, b: 234 },
  light_cyan: { r: 180, g: 225, b: 238 }
};

/**
 * High-Precision Portrait Background Color Replacer
 * Accurately replaces background color without altering skin tones, face, hair, or clothing.
 */
async function replacePortraitBackground(imageBuffer, targetBg = 'sky_blue') {
  if (targetBg === 'original' || !BACKGROUND_PRESETS[targetBg]) {
    return imageBuffer;
  }

  const targetColor = BACKGROUND_PRESETS[targetBg];
  const { data, info } = await sharp(imageBuffer)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 3 (RGB)
  const totalPixels = width * height;

  // 1. Sample Background Color Profile from Top Corners & Perimeter
  let sampleR = 0, sampleG = 0, sampleB = 0, sampleCount = 0;
  const sampleMaxY = Math.max(5, Math.floor(height * 0.18));
  const sampleBorderX = Math.max(5, Math.floor(width * 0.15));

  for (let y = 0; y < sampleMaxY; y++) {
    for (let x = 0; x < width; x++) {
      if (y < 8 || x < sampleBorderX || x > width - sampleBorderX) {
        const idx = (y * width + x) * channels;
        sampleR += data[idx];
        sampleG += data[idx + 1];
        sampleB += data[idx + 2];
        sampleCount++;
      }
    }
  }

  const bgAvgR = sampleCount > 0 ? sampleR / sampleCount : 240;
  const bgAvgG = sampleCount > 0 ? sampleG / sampleCount : 240;
  const bgAvgB = sampleCount > 0 ? sampleB / sampleCount : 240;

  // 2. Build Mask using BFS Flood-Fill from corners to capture continuous background
  const isBgMask = new Uint8Array(totalPixels);
  const visited = new Uint8Array(totalPixels);
  const queue = [];

  // Seed BFS queue from top edge, top-left and top-right corners
  for (let x = 0; x < width; x++) {
    queue.push(0 * width + x); // Top edge
    visited[0 * width + x] = 1;
  }
  for (let y = 0; y < Math.floor(height * 0.4); y++) {
    queue.push(y * width + 0); // Left edge
    queue.push(y * width + (width - 1)); // Right edge
    visited[y * width + 0] = 1;
    visited[y * width + (width - 1)] = 1;
  }

  let head = 0;
  while (head < queue.length) {
    const currIdx = queue[head++];
    const px = currIdx % width;
    const py = Math.floor(currIdx / width);
    const byteIdx = currIdx * channels;

    const r = data[byteIdx];
    const g = data[byteIdx + 1];
    const b = data[byteIdx + 2];

    // Check if pixel is human skin tone (Fitzpatrick / Indian / Asian skin tones)
    const isSkin = (
      r > 70 && g > 38 && b > 20 &&
      r > g && g >= b &&
      (r - g) >= 6 &&
      (r - b) >= 12
    );

    // Check if pixel is dark hair / eyes
    const isHair = (
      py < height * 0.55 &&
      r < 50 && g < 50 && b < 50
    );

    // Color distance from sampled background
    const diffR = r - bgAvgR;
    const diffG = g - bgAvgG;
    const diffB = b - bgAvgB;
    const colorDist = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB);

    if (!isSkin && !isHair && colorDist < 95) {
      isBgMask[currIdx] = 1;

      // Expand to 4-connected neighbors
      const neighbors = [
        px > 0 ? currIdx - 1 : -1,
        px < width - 1 ? currIdx + 1 : -1,
        py > 0 ? currIdx - width : -1,
        py < height - 1 ? currIdx + width : -1
      ];

      for (let n = 0; n < 4; n++) {
        const nIdx = neighbors[n];
        if (nIdx >= 0 && !visited[nIdx]) {
          visited[nIdx] = 1;
          queue.push(nIdx);
        }
      }
    }
  }

  // 3. Replace background pixels in output buffer
  const outputData = Buffer.from(data);

  for (let i = 0; i < totalPixels; i++) {
    if (isBgMask[i] === 1) {
      const idx = i * channels;
      outputData[idx] = targetColor.r;
      outputData[idx + 1] = targetColor.g;
      outputData[idx + 2] = targetColor.b;
    }
  }

  // 4. Return processed image with clean background
  return await sharp(outputData, {
    raw: {
      width,
      height,
      channels
    }
  }).jpeg({ quality: 96 }).toBuffer();
}

module.exports = {
  BACKGROUND_PRESETS,
  replacePortraitBackground
};
