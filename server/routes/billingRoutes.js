const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

router.post('/invoices', billingController.createInvoice);
router.get('/invoices', billingController.getInvoices);
router.get('/pricing', billingController.getPricingCatalog);
router.patch('/pricing/:id', billingController.updateServicePrice);

module.exports = router;
