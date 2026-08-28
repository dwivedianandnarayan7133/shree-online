const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', websiteController.getShortcuts);
router.post('/', verifyToken, requireRole('admin'), websiteController.createShortcut);
router.delete('/:id', verifyToken, requireRole('admin'), websiteController.deleteShortcut);

module.exports = router;
