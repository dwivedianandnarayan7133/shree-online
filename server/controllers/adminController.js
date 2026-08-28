const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Request = require('../models/Request');
const Invoice = require('../models/Invoice');
const PrintJob = require('../models/PrintJob');
const AuditLog = require('../models/AuditLog');
const SystemConfig = require('../models/SystemConfig');
const { performManualCleanup } = require('../services/cleanupCronService');
const { logAudit } = require('../utils/logger');

// Dashboard Overview KPIs
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalCustomers,
      totalRequests,
      todayRequests,
      pendingRequests,
      completedRequests,
      activePrintJobs,
      allInvoices
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Request.countDocuments({}),
      Request.countDocuments({ createdAt: { $gte: today } }),
      Request.countDocuments({ status: { $in: ['new', 'processing', 'waiting_customer'] } }),
      Request.countDocuments({ status: 'completed' }),
      PrintJob.countDocuments({ status: { $in: ['pending', 'printing'] } }),
      Invoice.find({ paymentStatus: 'paid' })
    ]);

    const totalRevenue = allInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
    const todayRevenue = allInvoices
      .filter(inv => new Date(inv.createdAt) >= today)
      .reduce((acc, inv) => acc + inv.grandTotal, 0);

    // Calculate disk storage usage in uploads folder
    let totalStorageBytes = 0;
    let fileCount = 0;
    const uploadDirs = [
      path.join(__dirname, '../uploads/temp'),
      path.join(__dirname, '../uploads/processed'),
      path.join(__dirname, '../uploads/customer_records')
    ];

    uploadDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        files.forEach(f => {
          try {
            const stat = fs.statSync(path.join(dir, f));
            if (stat.isFile()) {
              totalStorageBytes += stat.size;
              fileCount++;
            }
          } catch (e) {}
        });
      }
    });

    const storageMb = (totalStorageBytes / (1024 * 1024)).toFixed(2);

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalRequests,
        todayRequests,
        pendingRequests,
        completedRequests,
        activePrintJobs,
        totalRevenue,
        todayRevenue,
        fileCount,
        storageMb,
        storageBytes: totalStorageBytes
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Audit Logs
const getAuditLogs = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, total, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get System Configuration
const getSystemConfig = async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({});
    }
    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update System Configuration
const updateSystemConfig = async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig();
    }

    const {
      portalName,
      tagline,
      retentionHours,
      adShieldEnabled,
      blockMaliciousPopups,
      preventRedirects,
      cyberCafeName,
      cyberCafePhone,
      cyberCafeEmail,
      taxPercent
    } = req.body;

    if (portalName !== undefined) config.portalName = portalName;
    if (tagline !== undefined) config.tagline = tagline;
    if (retentionHours !== undefined) config.retentionHours = Number(retentionHours);
    if (adShieldEnabled !== undefined) config.adShieldEnabled = adShieldEnabled;
    if (blockMaliciousPopups !== undefined) config.blockMaliciousPopups = blockMaliciousPopups;
    if (preventRedirects !== undefined) config.preventRedirects = preventRedirects;
    if (cyberCafeName !== undefined) config.cyberCafeName = cyberCafeName;
    if (cyberCafePhone !== undefined) config.cyberCafePhone = cyberCafePhone;
    if (cyberCafeEmail !== undefined) config.cyberCafeEmail = cyberCafeEmail;
    if (taxPercent !== undefined) config.taxPercent = Number(taxPercent);

    config.updatedBy = req.user ? req.user.name : 'Admin';
    await config.save();

    await logAudit({
      action: 'SYSTEM_CONFIG_UPDATED',
      user: req.user ? req.user.name : 'Admin',
      role: 'admin',
      details: req.body
    });

    res.json({ success: true, message: 'Configuration saved.', config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Trigger Manual Cleanup
const triggerCleanup = async (req, res) => {
  try {
    const { retentionHours = 1 } = req.body;
    const result = await performManualCleanup(Number(retentionHours));

    await logAudit({
      action: 'MANUAL_CLEANUP_TRIGGERED',
      user: req.user ? req.user.name : 'Admin',
      role: 'admin',
      details: result
    });

    res.json({
      success: true,
      message: `Cleaned ${result.cleanedFilesCount} temporary files (${result.freedKb} KB freed).`,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Manage Users / Operators
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getAuditLogs,
  getSystemConfig,
  updateSystemConfig,
  triggerCleanup,
  getAllUsers
};
