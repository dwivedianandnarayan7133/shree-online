const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  portalName: { type: String, default: 'Shree Online (Mahuli, S.K.N)' },
  tagline: { type: String, default: 'One Window. Every Digital Service.' },
  retentionHours: { type: Number, default: 24, enum: [1, 6, 12, 24, 48, 168] },
  adShieldEnabled: { type: Boolean, default: true },
  blockMaliciousPopups: { type: Boolean, default: true },
  preventRedirects: { type: Boolean, default: true },
  watermarkEnabled: { type: Boolean, default: false },
  defaultCurrency: { type: String, default: '₹' },
  taxPercent: { type: Number, default: 0 },
  
  // Static Page Content (About Us)
  establishedYear: { type: String, default: '2013' },
  aboutUsText: { 
    type: String, 
    default: 'Established in 2013, Shree Online Sewa Kendra has been the most trusted, continuous digital services landmark in Mahuli and across Sant Kabir Nagar. We deliver error-free government applications, student exam services, instant passport photo creation, universal document restoration, and citizen welfare assistance under one unified window.' 
  },
  
  // Owner Information (Krishan Narayan Dwivedi)
  ownerName: { type: String, default: 'Krishan Narayan Dwivedi' },
  ownerRole: { type: String, default: 'Founder & Managing Owner' },
  ownerPhone: { type: String, default: '9161400719' },
  ownerEmail: { type: String, default: 'onlinebaba111111@gmail.com' },
  ownerQuote: { 
    type: String, 
    default: 'Since establishing Shree Online Sewa Kendra in 2013 here in Mahuli, our sole commitment has been to provide every student, youth, and family across Sant Kabir Nagar with reliable, honest, and high-speed digital services. Over these 13+ years, thousands of candidates have filled exam forms and received verified certificates through our center. We remain dedicated to your success and trust.' 
  },

  // Admin Information (Kamal Narayan Dwivedi - Managing Director & Main Controller)
  adminName: { type: String, default: 'Kamal Narayan Dwivedi' },
  adminRole: { type: String, default: 'Managing Director & Main Controller' },
  adminPhone: { type: String, default: '8090794210' },
  adminEmail: { type: String, default: 'kdshree778@gmail.com' },
  adminQuote: { 
    type: String, 
    default: 'We have integrated Google Mail notifications, OTP verification, modern AdShield protection, and AI document studios to ensure 100% smooth operations for our community. Whether generating A4 passport sheets or filling recruitment forms, Shree Online delivers supreme reliability.' 
  },

  // Footer & Center Info
  cyberCafeName: { type: String, default: 'Shree Online Sewa Kendra' },
  cyberCafeAddress: { type: String, default: 'Main Market, Mahuli, Sant Kabir Nagar (S.K.N), Uttar Pradesh - 272172' },
  cyberCafePhone: { type: String, default: '+91 9161400719 / +91 8090794210' },
  cyberCafeEmail: { type: String, default: 'kdshree778@gmail.com' },
  footerTimings: { type: String, default: 'Monday – Sunday (08:00 AM – 09:00 PM)' },
  footerCopyright: { type: String, default: '© 2013 – 2026 Shree Online Sewa Kendra • Mahuli, Sant Kabir Nagar (S.K.N), U.P. All rights reserved.' },
  
  updatedBy: { type: String, default: 'Kamal Narayan Dwivedi (Admin MD)' }
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
