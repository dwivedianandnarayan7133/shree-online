const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const upload = require('../middleware/uploadMiddleware');

router.post('/passport-photo', upload.single('photo'), imageController.generateSinglePassportPhoto);
router.post('/passport-sheet', upload.single('photo'), imageController.generatePassportSheet);
router.post('/restore-document', upload.single('image'), imageController.restoreOldDocument);
router.post('/process-signature', upload.single('image'), imageController.processSignature);
router.post('/transform', upload.single('image'), imageController.transformImage);

module.exports = router;
