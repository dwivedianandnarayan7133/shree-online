const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/stats', adminController.getDashboardStats);
router.get('/logs', verifyToken, requireRole('admin'), adminController.getAuditLogs);
router.get('/config', adminController.getSystemConfig);
router.put('/config', verifyToken, requireRole('admin'), adminController.updateSystemConfig);
router.post('/cleanup', verifyToken, requireRole('admin'), adminController.triggerCleanup);
router.get('/users', verifyToken, requireRole('admin'), adminController.getAllUsers);

module.exports = router;
