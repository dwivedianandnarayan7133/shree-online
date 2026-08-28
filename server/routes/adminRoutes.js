const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/stats', adminController.getDashboardStats);
router.get('/logs', verifyToken, requireRole('admin'), adminController.getAuditLogs);
router.get('/config', adminController.getSystemConfig);
router.put('/config', verifyToken, requireRole('admin'), adminController.updateSystemConfig);
router.post('/profile-photo', verifyToken, requireRole('admin'), upload.single('photo'), adminController.uploadProfilePhoto);
router.post('/cleanup', verifyToken, requireRole('admin'), adminController.triggerCleanup);
router.get('/users', verifyToken, requireRole('admin'), adminController.getAllUsers);

// Operator Management Routes
router.post('/operators', verifyToken, requireRole('admin'), adminController.createOperator);
router.put('/operators/:id', verifyToken, requireRole('admin'), adminController.updateOperator);
router.delete('/operators/:id', verifyToken, requireRole('admin'), adminController.deleteOperator);

// Service Catalog Management
router.post('/services', verifyToken, requireRole('admin'), adminController.createServiceItem);
router.delete('/services/:id', verifyToken, requireRole('admin'), adminController.deleteServiceItem);

module.exports = router;
