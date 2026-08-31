const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public or Customer can submit request
router.post('/', upload.array('files', 10), requestController.createRequest);

// Query requests (Authenticated: Operator, Admin, or Customer for own)
router.get('/', requestController.getRequests);
router.get('/:id', requestController.getRequestById);

// Update status and operator handover
router.patch('/:id/status', verifyToken, requireRole('admin', 'operator'), requestController.updateRequestStatus);
router.post('/:id/process-file', verifyToken, requireRole('admin', 'operator'), upload.single('file'), requestController.addProcessedFile);
router.patch('/:id/assign', verifyToken, requireRole('admin', 'operator'), requestController.assignOperator);

// Binary File Download Route (Serves MongoDB Buffered Data directly)
router.get('/:id/file/:fileId', requestController.downloadFile);

module.exports = router;
