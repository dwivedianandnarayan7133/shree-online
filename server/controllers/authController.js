const User = require('../models/User');
const OtpVerification = require('../models/OtpVerification');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');
const AuditLog = require('../models/AuditLog');
const logAudit = async (data) => { try { await AuditLog.create(data); } catch(e){} };
const {
  sendRegisterOtpEmail,
  sendPasswordResetOtpEmail,
  sendWelcomeEmail,
  sendLoginAlertEmail
} = require('../services/emailService');

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * 1. Step 1 of Registration: Send 6-Digit OTP to Gmail
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

    // Store in MongoDB persistent collection for serverless compatibility
    await OtpVerification.deleteMany({ email: cleanEmail, type: 'register' });
    await OtpVerification.create({
      email: cleanEmail,
      otp,
      type: 'register',
      payload: {
        name,
        email: cleanEmail,
        password,
        phone: phone || '',
        role: ['admin', 'operator'].includes(role) ? role : 'customer'
      },
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    try {
      await sendRegisterOtpEmail(cleanEmail, otp, name);
    } catch (mailErr) {
      console.warn('Gmail OTP email notice:', mailErr.message);
    }

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. (Code: ${otp})`,
      otp
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
    const record = await OtpVerification.findOne({ email: cleanEmail, type: 'register' });

    if (!record) {
      return res.status(400).json({ success: false, message: 'No registration request found or OTP expired. Please request a new OTP.' });
    }

    if (new Date() > record.expiresAt) {
      await OtpVerification.deleteOne({ _id: record._id });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check your Gmail.' });
    }

    const { name, password, role, phone } = record.payload;

    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      user = await User.create({
        name,
        email: cleanEmail,
        password,
        role: role || 'customer',
        phone: phone || ''
      });
    }

    await OtpVerification.deleteOne({ _id: record._id });

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

    await OtpVerification.deleteMany({ email: cleanEmail, type: 'forgot_password' });
    await OtpVerification.create({
      email: cleanEmail,
      otp,
      type: 'forgot_password',
      payload: { userId: user._id.toString() },
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    try {
      await sendPasswordResetOtpEmail(cleanEmail, otp, user.name);
    } catch (mailErr) {
      console.warn('Password reset mail notice:', mailErr.message);
    }

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
 * 4. Forgot Password: Step 2 - Verify OTP & Reset Password
 */
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = await OtpVerification.findOne({ email: cleanEmail, type: 'forgot_password' });

    if (!record) {
      return res.status(400).json({ success: false, message: 'No password reset request found or OTP expired.' });
    }

    if (new Date() > record.expiresAt) {
      await OtpVerification.deleteOne({ _id: record._id });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check your Gmail.' });
    }

    const user = await User.findById(record.payload.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    user.password = newPassword;
    await user.save();

    await OtpVerification.deleteOne({ _id: record._id });

    await logAudit({
      action: 'PASSWORD_RESET_COMPLETED',
      user: user.name,
      role: user.role,
      details: { email: cleanEmail },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Password reset successfully! You can now Sign In with your new password.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 5. Direct User Registration (Fallback)
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'customer', phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
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

    await logAudit({
      action: 'USER_REGISTERED',
      user: user.name,
      role: user.role,
      details: { email: user.email, role: user.role },
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
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 6. User Login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user);

    sendLoginAlertEmail(user.email, user.name, user.role, req.ip, new Date()).catch(e => console.warn('Login alert mail notice:', e.message));

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
        phone: user.phone
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getOperators = async (req, res) => {
  try {
    const operators = await User.find({
      role: { $in: ['operator', 'admin'] }
    }).select('-password');

    res.json({ success: true, count: operators.length, operators });
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
  getMe,
  getOperators
};
