const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  portalName: { type: String, default: 'Shree Online (Mahuli, S.K.N)' },
  tagline: { type: String, default: 'One Window. Every Digital Service.' },
  retentionHours: { type: Number, default: 24, enum: [1, 6, 24, 168] },
  adShieldEnabled: { type: Boolean, default: true },
  blockMaliciousPopups: { type: Boolean, default: true },
  preventRedirects: { type: Boolean, default: true },
  watermarkEnabled: { type: Boolean, default: false },
  defaultCurrency: { type: String, default: 'â‚¹' },
  taxPercent: { type: Number, default: 0 },
  cyberCafeName: { type: String, default: 'Digital Seva Cyber Point' },
  cyberCafeAddress: { type: String, default: 'Main Market, City Center, Station Road' },
  cyberCafePhone: { type: String, default: '+91 98765 43210' },
  cyberCafeEmail: { type: String, default: 'contact@digitalseva.com' },
  updatedBy: { type: String, default: 'Admin' }
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
