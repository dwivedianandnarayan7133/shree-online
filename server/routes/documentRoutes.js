const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const upload = require('../middleware/uploadMiddleware');

router.post('/images-to-pdf', upload.array('images', 20), documentController.convertImagesToPdf);
router.post('/merge-pdf', upload.array('pdfs', 10), documentController.mergePdfs);
router.post('/split-pdf', upload.single('pdf'), documentController.splitOrExtractPdf);
router.post('/rotate-pdf', upload.single('pdf'), documentController.rotatePdf);
router.post('/compress-pdf', upload.single('pdf'), documentController.compressPdf);

module.exports = router;
