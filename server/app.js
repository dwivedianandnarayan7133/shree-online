const jobRoutes = require('./routes/jobRoutes');
const { UPLOAD_PATHS } = require('./config/constants');
const adminController = require('./controllers/adminController');
require('dotenv').config();
﻿const express = require('express');
const cors = require('cors');
const path = require('path');
const adShieldGuard = require('./middleware/adShieldGuard');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');
const documentRoutes = require('./routes/documentRoutes');
const imageRoutes = require('./routes/imageRoutes');
const conversionRoutes = require('./routes/conversionRoutes');
const fileRoutes = require('./routes/fileRoutes');
const billingRoutes = require('./routes/billingRoutes');
const printRoutes = require('./routes/printRoutes');
const websiteRoutes = require('./routes/websiteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const proxyRoutes = require('./routes/proxyRoutes');

const app = express();

// Security & AdShield workspace protection headers
app.use(adShieldGuard);

// Global Middleware
app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    return callback(null, origin); // Reflect the requesting origin securely
  }, 
  credentials: true 
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(rateLimiter(300, 60 * 1000));

// Serve processed & temp uploads securely
app.use('/uploads', express.static(require('./config/constants').UPLOAD_PATHS.BASE, { setHeaders: (res) => { res.set('X-Content-Type-Options', 'nosniff'); res.set('Content-Disposition', 'inline'); } }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Content-Disposition', 'inline');
  }
}));

// Database fallback for Vercel Serverless where /tmp is ephemeral
app.use('/uploads/:type/:fileName', async (req, res, next) => {
  try {
    const { type, fileName } = req.params;
    if (type === 'customer_records' || type === 'processed') {
      const RequestModel = require('./models/Request');
      const dbReq = await RequestModel.findOne(
        type === 'customer_records' 
          ? { 'submittedFiles.fileName': fileName }
          : { 'processedFiles.fileName': fileName }
      );
      if (dbReq) {
        const file = type === 'customer_records' 
          ? dbReq.submittedFiles.find(f => f.fileName === fileName)
          : dbReq.processedFiles.find(f => f.fileName === fileName);
        
        if (file && file.fileData) {
          res.setHeader('Content-Type', file.mimeType);
          res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
          return res.send(file.fileData);
        }
      }
    }
    next();
  } catch (err) {
    next();
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/conversions', conversionRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/print', printRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/jobs', jobRoutes);
app.get('/api/config', (req, res) => adminController.getConfig(req, res));
app.use('/api/proxy', proxyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    portal: 'Shree Online (Mahuli, S.K.N)',
    timestamp: new Date().toISOString(),
    engine: 'Node.js + Express + Sharp + PDF-Lib + Tesseract.js'
  });
});

// Central Error Handler
app.use(errorHandler);

// Production Static Serving for Render (React Router Support)
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

module.exports = app;
