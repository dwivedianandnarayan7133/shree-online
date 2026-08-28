const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const upload = require('../middleware/uploadMiddleware');

router.post('/compress', upload.array('files', 15), fileController.compressFiles);
router.post('/zip', upload.array('files', 20), fileController.createZipArchive);
router.post('/unzip', upload.single('file'), fileController.extractZipArchive);

module.exports = router;
