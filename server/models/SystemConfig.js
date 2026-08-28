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
  ownerPhoto: { type: String, default: '' },
  ownerQuote: { 
    type: String, 
    default: `Welcome to Shree Online Sewa Kendra. When we laid the cornerstone of this digital institution in 2013 in the heart of Mahuli, Sant Kabir Nagar, our foundational objective was straightforward yet profound: to eliminate digital inequality and ensure that no student, job applicant, farmer, or senior citizen in our region would ever have to travel hours to district headquarters just to submit an online form or access digital government services.

Over the past 13+ years, Shree Online Sewa Kendra has stood as an unwavering pillar of integrity, precision, and technological reliability. We have assisted tens of thousands of rural and semi-urban candidates in successfully filling critical recruitment examination forms—including UP Police Bharti, SSC, Railway, UPSSSC PET, UPPSC, Banking, and Teaching eligibility tests. In our journey, we recognized early on that a small error in an application form can compromise years of hard work for an aspirant. Therefore, every application processed at our center undergoes a multi-layer verification protocol by our expert operators before final submission.

As founder and owner, I take immense pride in knowing that Shree Online has also served as a one-stop hub for citizen welfare documentation—spanning Aadhaar services, PAN card creation, income and caste certificate registration, Ayushman Bharat health cards, PM Kisan registrations, e-Shram facilitation, land revenue records (Bhulekh), passport size photo creation, and urgent color laser printing.

In 2026, we have expanded our physical infrastructure into a state-of-the-art digital enterprise portal. By integrating instant WhatsApp notifications, automated Google Mail dispatch, secure OTP authentication, and smart file compression engines, we are setting a new benchmark for cyber cafes across Eastern Uttar Pradesh. We remain eternally grateful to the citizens of Mahuli, Dhanghata, Khalilabad, and the entire Sant Kabir Nagar community for their steadfast faith in Shree Online Sewa Kendra. Our doors and our hearts remain open to serve your aspirations with complete dedication.` 
  },

  // Admin Information (Kamal Narayan Dwivedi - Managing Director & Main Controller)
  adminName: { type: String, default: 'Kamal Narayan Dwivedi' },
  adminRole: { type: String, default: 'Managing Director & Main Controller' },
  adminPhone: { type: String, default: '8090794210' },
  adminEmail: { type: String, default: 'kdshree778@gmail.com' },
  adminPhoto: { type: String, default: '' },
  adminQuote: { 
    type: String, 
    default: `As Managing Director and Main Controller of Shree Online Sewa Kendra, my core mandate is to ensure that our technology stack, cybersecurity standards, operational efficiency, and customer satisfaction operate at absolute peak performance every single day. Modern online services demand rapid execution, stringent data privacy, and uncompromised uptime.

Under our modernized operations framework, we have architected an integrated web platform that bridges high-speed hardware with intelligent software utilities. Our custom in-portal browser comes equipped with proprietary AdShield™ technology, which shields our operators and applicants from malicious advertising, suspicious redirect scripts, and invasive popups that plague official recruitment and public service portals. Furthermore, to safeguard citizen privacy, our automated server lifecycle securely cleanses expired temporary session files while preserving encrypted audit trails.

We have eliminated common cyber cafe bottlenecks with automated digital studios: our A4 passport photo generator instantly aligns 6 photos per line with precision cut-margin gutters and standard sky-blue exam backgrounds; our OCR conversion studio intelligently extracts degraded scanned paperwork into fully editable Microsoft Word (.docx) and Excel spreadsheets; and our document compression pipeline dynamically fits PDF files into strict government file size restrictions without loss of clarity.

Communication transparency is the cornerstone of our center's philosophy. We have integrated real-time Google Mail delivery so that every citizen receives automated confirmation emails when their registration or application is processed, alongside secure WhatsApp OTP routing for identity protection. Whether you visit our physical counter in Mahuli Market or access our online customer portal from your mobile phone, you are backed by a dedicated team of trained operators and a robust digital infrastructure designed to serve you with zero friction. We welcome your feedback, and we pledge to continue innovating to keep Shree Online at the pinnacle of digital excellence.` 
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
