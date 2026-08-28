const express = require('express');
const router = express.Router();
const printController = require('../controllers/printController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', upload.single('file'), printController.createPrintJob);
router.get('/', printController.getPrintJobs);
router.patch('/:id/status', verifyToken, requireRole('admin', 'operator'), printController.updatePrintJobStatus);

module.exports = router;
