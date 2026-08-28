const express = require('express');
const router = express.Router();
const proxyController = require('../controllers/proxyController');

router.all('/browse', proxyController.browseUrl);
router.post('/clear-cache', proxyController.clearCache);

module.exports = router;
