const mongoose = require('mongoose');

const OtpVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['register', 'forgot_password'],
    default: 'register'
  },
  payload: {
    type: Object,
    default: {}
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Auto-delete document when expired (TTL index)
OtpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpVerification', OtpVerificationSchema);
