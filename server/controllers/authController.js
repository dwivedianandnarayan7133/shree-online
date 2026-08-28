const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');
const { logAudit } = require('../utils/logger');

const WHATSAPP_NUMBERS = {
  primary: '9161400719',
  secondary: '8090794210',
  formattedPrimary: '+91 9161400719',
  formattedSecondary: '+91 8090794210'
};

// In-memory OTP Store with 10-min expiration
const otpStore = {};

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name, phone: user.phone },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Standard Register
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'customer', phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: ['admin', 'operator'].includes(role) ? role : 'customer',
      phone: phone || ''
    });

    const token = signToken(user);

    await logAudit({
      action: 'USER_REGISTER',
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
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Standard Password Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
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

    await logAudit({
      action: 'USER_LOGIN',
      user: user.name,
      role: user.role,
      details: { email: user.email },
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

// Send WhatsApp OTP (Forwarded via Owner WhatsApp)
const sendWhatsAppOtp = async (req, res) => {
  try {
    const { phone, name, type = 'login' } = req.body;

    if (!phone || phone.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number.' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[cleanPhone] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 mins
      name: name || '',
      type
    };

    // Owner WhatsApp forward links (Never exposes OTP on browser screen)
    const ownerMsg = `Hello Shree Online Owner (Mahuli, S.K.N),\nCustomer (+91 ${cleanPhone}) is requesting ${type === 'register' ? 'Registration' : 'Login'} OTP verification.\n\n*One-Time Password: ${otp}*`;
    const waOwnerLink1 = `https://wa.me/91${WHATSAPP_NUMBERS.primary}?text=${encodeURIComponent(ownerMsg)}`;
    const waOwnerLink2 = `https://wa.me/91${WHATSAPP_NUMBERS.secondary}?text=${encodeURIComponent(ownerMsg)}`;

    await logAudit({
      action: 'WHATSAPP_OTP_FORWARDED_BY_OWNER',
      user: name || cleanPhone,
      details: { phone: cleanPhone, type, forwardedBy: WHATSAPP_NUMBERS.primary }
    });

    res.json({
      success: true,
      message: `OTP forwarded by Shree Online Owner WhatsApp (+91 ${WHATSAPP_NUMBERS.primary}). Please check your WhatsApp.`,
      cleanPhone,
      whatsappNumbers: WHATSAPP_NUMBERS,
      waOwnerLink1,
      waOwnerLink2
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Verify WhatsApp OTP & Login / Register User
const verifyWhatsAppOtp = async (req, res) => {
  try {
    const { phone, otp, name, role = 'customer' } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone number and OTP are required.' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    const record = otpStore[cleanPhone];

    if (!record) {
      return res.status(400).json({ success: false, message: 'No active OTP request found for this number. Please request a new OTP.' });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[cleanPhone];
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new OTP.' });
    }

    if (record.otp !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP entered. Please check your WhatsApp and try again.' });
    }

    // OTP is valid - clear store
    delete otpStore[cleanPhone];

    // Find or create user by phone / email
    let user = await User.findOne({
      $or: [
        { phone: cleanPhone },
        { email: `${cleanPhone}@shreeonline.local` }
      ]
    });

    if (!user) {
      // Auto-register new customer via WhatsApp OTP
      const userName = name || record.name || `User-${cleanPhone.slice(-4)}`;
      user = await User.create({
        name: userName,
        email: `${cleanPhone}@shreeonline.local`,
        password: `wa-${cleanPhone}-${Date.now()}`,
        phone: cleanPhone,
        role: ['admin', 'operator'].includes(role) ? role : 'customer'
      });
    } else {
      if (name && (!user.name || user.name.startsWith('User-'))) {
        user.name = name;
      }
      user.lastLogin = new Date();
      await user.save();
    }

    const token = signToken(user);

    await logAudit({
      action: 'WHATSAPP_OTP_LOGIN_SUCCESS',
      user: user.name,
      role: user.role,
      details: { phone: cleanPhone, email: user.email }
    });

    res.json({
      success: true,
      message: 'WhatsApp OTP verified successfully.',
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

// Get current user profile
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone
    },
    whatsappHelpline: WHATSAPP_NUMBERS
  });
};

// Get all operators and admins
const getOperators = async (req, res) => {
  try {
    const operators = await User.find({ role: { $in: ['admin', 'operator'] }, isActive: true }).select('name email role phone');
    res.json({ success: true, operators, whatsappNumbers: WHATSAPP_NUMBERS });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  register,
  login,
  sendWhatsAppOtp,
  verifyWhatsAppOtp,
  getMe,
  getOperators,
  WHATSAPP_NUMBERS
};
