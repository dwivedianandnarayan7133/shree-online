const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Gmail Registration OTP flow
router.post('/register-otp', authController.sendRegisterOtp);
router.post('/verify-register-otp', authController.verifyRegisterOtp);

// Forgot & Reset Password flow
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Standard auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
