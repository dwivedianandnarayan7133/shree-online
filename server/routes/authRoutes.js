const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-whatsapp-otp', authController.sendWhatsAppOtp);
router.post('/verify-whatsapp-otp', authController.verifyWhatsAppOtp);
router.get('/me', verifyToken, authController.getMe);
router.get('/operators', verifyToken, authController.getOperators);

module.exports = router;
