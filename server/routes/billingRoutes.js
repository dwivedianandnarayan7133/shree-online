const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.post('/invoices', verifyToken, requireRole('admin', 'operator'), billingController.createInvoice);
router.get('/invoices', verifyToken, requireRole('admin', 'operator'), billingController.getInvoices);
router.get('/pricing', billingController.getPricingCatalog);
router.patch('/pricing/:id', verifyToken, requireRole('admin'), billingController.updateServicePrice);

module.exports = router;
