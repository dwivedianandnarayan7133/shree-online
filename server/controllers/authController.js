const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');
const { logAudit } = require('../utils/logger');
const { 
  sendRegisterOtpEmail, 
  sendPasswordResetOtpEmail, 
  sendPasswordChangedEmail, 
  sendLoginAlertEmail, 
  sendWelcomeEmail, 
  OWNER_INFO, 
  ADMIN_INFO 
} = require('../services/emailService');

// In-memory OTP Stores with 10-minute expiry
const registrationOtpStore = {};
const passwordResetOtpStore = {};

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name, phone: user.phone },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * 1. Step 1 of Registration: Dispatch 6-Digit OTP to Gmail
 */
const sendRegisterOtp = async (req, res) => {
  try {
    const { name, email, password, phone, role = 'customer' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Name, Email, and Password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'This email is already registered. Please Sign In.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    registrationOtpStore[cleanEmail] = {
      otp,
      name,
      email: cleanEmail,
      password,
      phone: phone || '',
      role: ['admin', 'operator'].includes(role) ? role : 'customer',
      expiresAt: Date.now() + 10 * 60 * 1000
    };

    await sendRegisterOtpEmail(cleanEmail, otp, name);

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Please check your Gmail.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 2. Step 2 of Registration: Verify 6-Digit OTP & Create Account
 */
const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = registrationOtpStore[cleanEmail];

    if (!record) {
      return res.status(400).json({ success: false, message: 'No registration request found or OTP expired. Please request a new OTP.' });
    }

    if (Date.now() > record.expiresAt) {
      delete registrationOtpStore[cleanEmail];
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check your Gmail.' });
    }

    const user = await User.create({
      name: record.name,
      email: cleanEmail,
      password: record.password,
      role: record.role,
      phone: record.phone
    });

    delete registrationOtpStore[cleanEmail];

    const token = signToken(user);

    sendWelcomeEmail(user.email, user.name).catch(e => console.warn('Welcome mail notice:', e.message));
    sendLoginAlertEmail(user.email, user.name, user.role, req.ip, new Date()).catch(e => console.warn('Login alert notice:', e.message));

    await logAudit({
      action: 'USER_REGISTER_OTP_VERIFIED',
      user: user.name,
      role: user.role,
      details: { email: user.email, role: user.role, phone: user.phone },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      message: 'Account verified and created successfully! Welcome email sent to your Gmail.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 3. Forgot Password: Step 1 - Send Password Reset OTP to Gmail
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered Gmail address.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with this email address.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    passwordResetOtpStore[cleanEmail] = {
      otp,
      userId: user._id,
      expiresAt: Date.now() + 10 * 60 * 1000
    };

    await sendPasswordResetOtpEmail(cleanEmail, otp, user.name);

    await logAudit({
      action: 'PASSWORD_RESET_REQUESTED',
      user: user.name,
      role: user.role,
      details: { email: cleanEmail },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: `A 6-digit password recovery code has been sent to ${cleanEmail}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 4. Forgot Password: Step 2 - Verify OTP & Set New Password
 */
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and New Password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = passwordResetOtpStore[cleanEmail];

    if (!record) {
      return res.status(400).json({ success: false, message: 'No password reset request found or OTP expired. Please request a new OTP.' });
    }

    if (Date.now() > record.expiresAt) {
      delete passwordResetOtpStore[cleanEmail];
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check your Gmail.' });
    }

    const user = await User.findById(record.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    user.password = newPassword;
    await user.save();

    delete passwordResetOtpStore[cleanEmail];

    sendPasswordChangedEmail(user.email, user.name).catch(e => console.warn('Password changed notice:', e.message));

    await logAudit({
      action: 'PASSWORD_RESET_COMPLETED',
      user: user.name,
      role: user.role,
      details: { email: user.email },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 5. Standard Login: Verify Password & Send Login Alert to Gmail
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user);

    sendLoginAlertEmail(user.email, user.name, user.role, req.ip, new Date()).catch(e => console.warn('Login alert notice:', e.message));

    await logAudit({
      action: 'USER_LOGIN',
      user: user.name,
      role: user.role,
      details: { email: user.email, role: user.role },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      },
      message: 'Login successful. Security alert email dispatched.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 6. Get Current User Info
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 7. Direct Register (Fallback)
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'customer', phone } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const user = await User.create({
      name,
      email: cleanEmail,
      password,
      role: ['admin', 'operator'].includes(role) ? role : 'customer',
      phone: phone || ''
    });

    const token = signToken(user);

    sendWelcomeEmail(user.email, user.name).catch(e => console.warn('Welcome mail notice:', e.message));
    sendLoginAlertEmail(user.email, user.name, user.role, req.ip, new Date()).catch(e => console.warn('Login alert notice:', e.message));

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  sendRegisterOtp,
  verifyRegisterOtp,
  forgotPassword,
  resetPassword,
  register,
  login,
  getMe
};
