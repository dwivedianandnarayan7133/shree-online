const express = require('express');
const router = express.Router();
const conversionController = require('../controllers/conversionController');
const upload = require('../middleware/uploadMiddleware');

router.post('/ocr', upload.single('file'), conversionController.extractOcr);
router.post('/to-word', conversionController.exportToDocx);
router.post('/to-excel', conversionController.exportToExcel);

module.exports = router;
