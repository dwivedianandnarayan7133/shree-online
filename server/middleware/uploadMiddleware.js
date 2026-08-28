const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let destDir = path.join(__dirname, '../uploads/temp');
    if (req.baseUrl.includes('customer') || req.baseUrl.includes('request')) {
      destDir = path.join(__dirname, '../uploads/customer_records');
    } else if (req.baseUrl.includes('processed') || req.baseUrl.includes('tools')) {
      destDir = path.join(__dirname, '../uploads/temp');
    }
    fs.mkdirSync(destDir, { recursive: true });
    cb(null, destDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${uuidv4().substring(0, 8)}-${sanitized}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|webp|gif|bmp|tiff|pdf|doc|docx|xls|xlsx|txt|csv|zip/;
  const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    return cb(null, true);
  }
  cb(new Error('Only standard images, documents, PDFs, sheets, and ZIP files are permitted.'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: fileFilter
});

module.exports = upload;