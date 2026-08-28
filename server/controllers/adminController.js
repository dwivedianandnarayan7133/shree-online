const { UPLOAD_PATHS } = require('../config/constants');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Request = require('../models/Request');
const Invoice = require('../models/Invoice');
const PrintJob = require('../models/PrintJob');
const ServiceItem = require('../models/ServiceItem');
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

    let totalStorageBytes = 0;
    let fileCount = 0;
    const uploadDirs = [
      path.join(UPLOAD_PATHS.TEMP, ),
      path.join(UPLOAD_PATHS.PROCESSED, ),
      path.join(UPLOAD_PATHS.CUSTOMER, )
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
        storageMb,
        fileCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Audit Logs
const getAuditLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get System Configuration & Static Page Content
const getSystemConfig = async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({
        portalName: 'Shree Online (Mahuli, S.K.N)',
        tagline: 'One Window. Every Digital Service.',
        establishedYear: '2013'
      });
    }
    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update System Configuration, Static Pages (About Us) & Footer Content
const updateSystemConfig = async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig(req.body);
    } else {
      Object.assign(config, req.body);
      config.updatedBy = req.user ? req.user.name : 'Kamal Narayan Dwivedi (Admin MD)';
    }

    await config.save();

    await logAudit({
      action: 'SYSTEM_CONFIG_UPDATED',
      user: req.user ? req.user.name : 'Admin',
      role: 'admin',
      details: { updatedFields: Object.keys(req.body) },
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'System settings, static pages and footer updated successfully.', config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Profile Photo Upload for Admin, Owner, and Operators
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo uploaded.' });
    }

    const photoUrl = `/uploads/customer_records/${req.file.filename}`;
    const target = req.body.target; // 'owner', 'admin', or userId

    let config = await SystemConfig.findOne();
    if (!config) config = new SystemConfig({});

    if (target === 'owner') {
      config.ownerPhoto = photoUrl;
      await config.save();
    } else if (target === 'admin') {
      config.adminPhoto = photoUrl;
      await config.save();
      // Also update admin user if exists
      const adminUser = await User.findOne({ email: 'kdshree778@gmail.com' });
      if (adminUser) {
        adminUser.avatar = photoUrl;
        await adminUser.save();
      }
    } else if (target) {
      // Specific operator/user ID
      const user = await User.findById(target);
      if (user) {
        user.avatar = photoUrl;
        await user.save();
      }
    }

    await logAudit({
      action: 'PROFILE_PHOTO_UPLOADED',
      user: req.user ? req.user.name : 'Admin',
      role: 'admin',
      details: { target, photoUrl }
    });

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully.',
      photoUrl
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Trigger Manual Storage Cleanup
const triggerCleanup = async (req, res) => {
  try {
    const result = await performManualCleanup();
    await logAudit({
      action: 'MANUAL_STORAGE_CLEANUP',
      user: req.user ? req.user.name : 'Admin',
      role: 'admin',
      details: result,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Storage cleanup completed.', result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get All Users (Operators & Customers)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Operator Management: Create Operator
const createOperator = async (req, res) => {
  try {
    const { name, email, password, phone, role = 'operator', avatar = '' } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      avatar: avatar || '',
      role: ['admin', 'operator'].includes(role) ? role : 'operator'
    });

    await logAudit({
      action: 'OPERATOR_CREATED',
      user: req.user ? req.user.name : 'Admin',
      role: 'admin',
      details: { operator: user.name, email: user.email, role: user.role }
    });

    res.status(201).json({ success: true, message: 'Operator account created successfully.', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Operator Management: Update Operator
const updateOperator = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, isActive, password, avatar } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Operator not found.' });
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (role && ['admin', 'operator', 'customer'].includes(role)) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) user.password = password;

    await user.save();

    await logAudit({
      action: 'OPERATOR_UPDATED',
      user: req.user ? req.user.name : 'Admin',
      role: 'admin',
      details: { operatorId: id, updatedName: user.name }
    });

    res.json({ success: true, message: 'Operator updated successfully.', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Operator Management: Delete Operator
const deleteOperator = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);

    await logAudit({
      action: 'OPERATOR_DELETED',
      user: req.user ? req.user.name : 'Admin',
      role: 'admin',
      details: { operatorId: id }
    });

    res.json({ success: true, message: 'Operator account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create Service Item
const createServiceItem = async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    const service = await ServiceItem.create({
      name,
      category: category || 'online_form',
      price: Number(price),
      description: description || ''
    });
    res.status(201).json({ success: true, message: 'Service added to catalog.', service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete Service Item
const deleteServiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    await ServiceItem.findByIdAndDelete(id);
    res.json({ success: true, message: 'Service removed from catalog.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getAuditLogs,
  getSystemConfig,
  updateSystemConfig,
  uploadProfilePhoto,
  triggerCleanup,
  getAllUsers,
  createOperator,
  updateOperator,
  deleteOperator,
  createServiceItem,
  deleteServiceItem
};
