const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim(), 'utf8');
  console.log(`Created: ${relPath}`);
}

// 1. User.js
writeFile('server/models/User.js', `
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'operator', 'customer'], default: 'customer' },
  phone: { type: String, trim: true, default: '' },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
`);

// 2. Request.js
writeFile('server/models/Request.js', `
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  fileId: { type: String, required: true },
  originalName: { type: String, required: true },
  fileName: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  actionType: { type: String, default: 'uploaded' },
  isTemporary: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now }
});

const requestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true, index: true },
  customerName: { type: String, required: true, trim: true },
  customerPhone: { type: String, required: true, trim: true },
  customerEmail: { type: String, trim: true, default: '' },
  customerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  serviceCategory: { 
    type: String, 
    enum: ['Government Application', 'Document & Printing', 'Photo & ID', 'Conversion & OCR', 'Form Filling & Exam', 'General Digital Service'],
    default: 'General Digital Service' 
  },
  serviceName: { type: String, required: true, trim: true },
  instructions: { type: String, default: '' },
  submittedFiles: [fileSchema],
  processedFiles: [fileSchema],
  status: { 
    type: String, 
    enum: ['new', 'processing', 'waiting_customer', 'completed', 'cancelled', 'archived'], 
    default: 'new',
    index: true
  },
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
    updatedBy: { type: String, default: 'System' }
  }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedOperatorName: { type: String, default: 'Unassigned' },
  operatorNotes: { type: String, default: '' },
  priority: { type: String, enum: ['normal', 'urgent', 'high'], default: 'normal' },
  totalCost: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
`);

// 3. ServiceItem.js
writeFile('server/models/ServiceItem.js', `
const mongoose = require('mongoose');

const serviceItemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: { 
    type: String, 
    enum: ['Document Tools', 'Image Tools', 'Conversion & OCR', 'Printing & Scanning', 'Govt & CSC Services', 'Utilities'],
    required: true 
  },
  basePrice: { type: Number, required: true, default: 10 },
  unit: { type: String, default: 'per page/copy' },
  description: { type: String, default: '' },
  estimatedMinutes: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true },
  icon: { type: String, default: 'FileText' }
}, { timestamps: true });

module.exports = mongoose.model('ServiceItem', serviceItemSchema);
`);

// 4. Invoice.js
writeFile('server/models/Invoice.js', `
const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true, index: true },
  requestId: { type: String, default: '' },
  customerName: { type: String, required: true, trim: true },
  customerPhone: { type: String, required: true, trim: true },
  items: [invoiceItemSchema],
  subtotal: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0 },
  taxPercent: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true, default: 0 },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'card', 'online', 'pending'], default: 'cash' },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'cancelled'], default: 'paid' },
  operatorName: { type: String, default: 'Admin Operator' },
  notes: { type: String, default: 'Thank you for visiting Cyber Cafe Portal!' }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
`);

// 5. PrintJob.js
writeFile('server/models/PrintJob.js', `
const mongoose = require('mongoose');

const printJobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number, default: 0 },
  copies: { type: Number, default: 1, min: 1 },
  colorMode: { type: String, enum: ['bw', 'color'], default: 'bw' },
  paperSize: { type: String, enum: ['A4', '4x6', 'Letter', 'Legal', 'A3'], default: 'A4' },
  orientation: { type: String, enum: ['portrait', 'landscape'], default: 'portrait' },
  pageRange: { type: String, default: 'all' },
  doubleSided: { type: Boolean, default: false },
  customerName: { type: String, default: 'Walk-in Customer' },
  status: { type: String, enum: ['pending', 'printing', 'completed', 'cancelled'], default: 'pending', index: true },
  cost: { type: Number, default: 5 },
  operatorNotes: { type: String, default: '' },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('PrintJob', printJobSchema);
`);

// 6. WebsiteShortcut.js
writeFile('server/models/WebsiteShortcut.js', `
const mongoose = require('mongoose');

const websiteShortcutSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['Government Services', 'Education & Exams', 'Banking & Financial', 'Railway & Travel', 'Employment & CSC', 'Utility Services', 'Document Tools'],
    required: true 
  },
  description: { type: String, default: '' },
  icon: { type: String, default: 'Globe' },
  badge: { type: String, default: 'Official' },
  isVerified: { type: Boolean, default: true },
  requiresNewTab: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteShortcut', websiteShortcutSchema);
`);

// 7. AuditLog.js
writeFile('server/models/AuditLog.js', `
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true, index: true },
  user: { type: String, default: 'Anonymous' },
  role: { type: String, default: 'customer' },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: '127.0.0.1' },
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
`);

// 8. SystemConfig.js
writeFile('server/models/SystemConfig.js', `
const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  portalName: { type: String, default: 'Cyber Cafe Management Portal' },
  tagline: { type: String, default: 'One Window. Every Digital Service.' },
  retentionHours: { type: Number, default: 24, enum: [1, 6, 24, 168] },
  adShieldEnabled: { type: Boolean, default: true },
  blockMaliciousPopups: { type: Boolean, default: true },
  preventRedirects: { type: Boolean, default: true },
  watermarkEnabled: { type: Boolean, default: false },
  defaultCurrency: { type: String, default: '₹' },
  taxPercent: { type: Number, default: 0 },
  cyberCafeName: { type: String, default: 'Digital Seva Cyber Point' },
  cyberCafeAddress: { type: String, default: 'Main Market, City Center, Station Road' },
  cyberCafePhone: { type: String, default: '+91 98765 43210' },
  cyberCafeEmail: { type: String, default: 'contact@digitalseva.com' },
  updatedBy: { type: String, default: 'Admin' }
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
`);

// 9. utils/logger.js
writeFile('server/utils/logger.js', `
const AuditLog = require('../models/AuditLog');

async function logAudit({ action, user = 'System', role = 'system', details = {}, ipAddress = '127.0.0.1' }) {
  try {
    await AuditLog.create({
      action,
      user,
      role,
      details,
      ipAddress,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('AuditLog write error:', err.message);
  }
}

module.exports = { logAudit };
`);

// 10. middleware/authMiddleware.js
writeFile('server/middleware/authMiddleware.js', `
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trim();
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: \`Access forbidden. Requires one of roles: \${roles.join(', ')}\` 
      });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
`);

// 11. middleware/uploadMiddleware.js
writeFile('server/middleware/uploadMiddleware.js', `
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
    const uniqueName = \`\${Date.now()}-\${uuidv4().substring(0, 8)}-\${sanitized}\`;
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
`);

// 12. middleware/adShieldGuard.js
writeFile('server/middleware/adShieldGuard.js', `
const adShieldGuard = (req, res, next) => {
  // Security headers to prevent malicious popups, frame injections, and unauthorized redirects
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-AdShield-Protected', 'Active');
  next();
};

module.exports = adShieldGuard;
`);

// 13. middleware/rateLimiter.js
writeFile('server/middleware/rateLimiter.js', `
const requestCounts = new Map();

const rateLimiter = (limit = 120, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    
    const clientData = requestCounts.get(ip);
    if (now > clientData.resetAt) {
      clientData.count = 1;
      clientData.resetAt = now + windowMs;
      return next();
    }
    
    clientData.count++;
    if (clientData.count > limit) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Cyber Cafe Portal rate limiter active. Please slow down.'
      });
    }
    next();
  };
};

module.exports = rateLimiter;
`);

// 14. middleware/errorHandler.js
writeFile('server/middleware/errorHandler.js', `
const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
`);

console.log('All models and middleware written successfully!');
