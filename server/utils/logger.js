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