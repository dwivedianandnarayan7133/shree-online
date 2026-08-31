const mongoose = require('mongoose');
const User = require('../models/User');
const ServiceItem = require('../models/ServiceItem');
const WebsiteShortcut = require('../models/WebsiteShortcut');
const Request = require('../models/Request');
const Invoice = require('../models/Invoice');
const PrintJob = require('../models/PrintJob');
const SystemConfig = require('../models/SystemConfig');

async function seedInitialData() {
  try {
    // 1. Seed System Configuration
    const existingConfig = await SystemConfig.findOne();
    if (!existingConfig) {
      await SystemConfig.create({
        portalName: 'Shree Online Sewa Kendra (Est. 2013)',
        tagline: 'One Window. Every Digital Service.',
        retentionHours: 24,
        adShieldEnabled: true,
        blockMaliciousPopups: true,
        preventRedirects: true,
        cyberCafeName: 'Shree Online Sewa Kendra',
        cyberCafeAddress: 'Main Market, Mahuli, Sant Kabir Nagar (S.K.N), Uttar Pradesh - 272172',
        cyberCafePhone: '+91 9161400719 / +91 8090794210',
        cyberCafeEmail: 'onlinebaba111111@gmail.com',
        defaultCurrency: '₹',
        taxPercent: 0
      });
      console.log('✅ System configuration seeded for Shree Online Mahuli.');
    }

    // 2. Seed Owner (Krishan Narayan Dwivedi) & Admin (Kamal Narayan Dwivedi)
    const ownerExists = await User.findOne({ email: 'onlinebaba111111@gmail.com' });
    if (!ownerExists) {
      await User.create({
        name: 'Krishan Narayan Dwivedi',
        email: 'onlinebaba111111@gmail.com',
        password: 'Shiv@241',
        role: 'admin',
        phone: '9161400719'
      });
      console.log('✅ Owner account created: Krishan Narayan Dwivedi (onlinebaba111111@gmail.com / owner123)');
    }

    const adminExists = await User.findOne({ email: 'kdshree778@gmail.com' });
    if (!adminExists) {
      await User.create({
        name: 'Kamal Narayan Dwivedi',
        email: 'kdshree778@gmail.com',
        password: 'Shiv@241',
        role: 'admin',
        phone: '8090794210'
      });
      console.log('✅ Admin account created: Kamal Narayan Dwivedi (kdshree778@gmail.com / admin123)');
    }

    // Also support default demo credentials
    const defaultAdmin = await User.findOne({ email: 'admin@cybercafe.com' });
    if (!defaultAdmin) {
      await User.create({
        name: 'Kamal Narayan Dwivedi (Admin)',
        email: 'admin@cybercafe.com',
        password: 'Shiv@241',
        role: 'admin',
        phone: '8090794210'
      });
    }

    const operatorExists = await User.findOne({ email: 'anandnarayan9120@gmail.com' });
    if (!operatorExists) {
      await User.create({
        name: 'Desk Operator (Anand Narayan)',
        email: 'anandnarayan9120@gmail.com',
        password: 'Shiv@241',
        role: 'operator',
        phone: '8090794210'
      });
    }

    let customerUser = await User.findOne({ email: 'customer@cybercafe.com' });
    if (!customerUser) {
      customerUser = await User.create({
        name: 'Pooja Verma (Student)',
        email: 'customer@cybercafe.com',
        password: 'customer123',
        role: 'customer',
        phone: '9161400719'
      });
    }

    // 3. Seed Service Items Catalog
    const serviceCount = await ServiceItem.countDocuments();
    if (serviceCount === 0) {
      const defaultServices = [
        {
          name: 'Passport Photo 6-Grid A4',
          category: 'photo',
          price: 40,
          description: '6 passport photos with exam sky-blue background and scissor cutting margin'
        },
        {
          name: 'Passport Photo Full A4 Sheet (42 Photos)',
          category: 'photo',
          price: 100,
          description: 'Full sheet 7 lines x 6 photos with padding on A4 photo gloss paper'
        },
        {
          name: 'Online Exam Form Fill (SSC / UPSSSC / Railway)',
          category: 'online_form',
          price: 80,
          description: 'Complete registration, biometric photo & signature resizing, fee submission'
        },
        {
          name: 'e-District Certificate (Income / Caste / Domicile)',
          category: 'online_form',
          price: 70,
          description: 'Official UP government revenue certificate online application and status tracking'
        },
        {
          name: 'PAN Card New / Correction (NSDL & UTI)',
          category: 'online_form',
          price: 150,
          description: 'Instant e-PAN generation and physical plastic PVC card postal dispatch'
        },
        {
          name: 'Black & White Printout (Per Page)',
          category: 'printing',
          price: 5,
          description: 'High resolution A4 600DPI laser print'
        },
        {
          name: 'Color Glossy Photo Printout (Per Page)',
          category: 'printing',
          price: 15,
          description: 'High-contrast color document or certificate print'
        },
        {
          name: 'Old Damaged Document Restore & OCR (Word / Excel)',
          category: 'scan_doc',
          price: 50,
          description: 'Deep de-skewing, contrast enhancement, text & table extraction to editable doc'
        },
        {
          name: 'A4 Document Lamination & Sealing',
          category: 'lamination',
          price: 25,
          description: '125-micron waterproof thermal plastic lamination'
        }
      ];

      await ServiceItem.insertMany(defaultServices);
      console.log('✅ Service items catalog seeded.');
    }

    // 4. Seed Essential Government & Exam Shortcuts
    const shortcutCount = await WebsiteShortcut.countDocuments();
    if (shortcutCount === 0) {
      const defaultShortcuts = [
        {
          title: 'UPSSSC Official Portal',
          url: 'https://upsssc.gov.in',
          category: 'Exam & Govt',
          isGovt: true,
          description: 'UP Subordinate Services Selection Commission Notifications & PET Forms',
          order: 1
        },
        {
          title: 'Staff Selection Commission (SSC)',
          url: 'https://ssc.gov.in',
          category: 'Exam & Govt',
          isGovt: true,
          description: 'CGL, CHSL, MTS, GD Constable Applications & Admit Cards',
          order: 2
        },
        {
          title: 'e-District Uttar Pradesh',
          url: 'https://edistrict.up.gov.in',
          category: 'Certificates',
          isGovt: true,
          description: 'Caste, Income, Domicile & Revenue Certificates Portal',
          order: 3
        },
        {
          title: 'NSDL PAN Card Online Portal',
          url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html',
          category: 'Identity',
          isGovt: true,
          description: 'Online PAN Application, Verification & Reprint',
          order: 4
        },
        {
          title: 'UIDAI Aadhaar Self Service',
          url: 'https://myaadhaar.uidai.gov.in',
          category: 'Identity',
          isGovt: true,
          description: 'Aadhaar Download, PVC Card Order & Demographic Update',
          order: 5
        },
        {
          title: 'UP Scholarship & Fee Reimbursement',
          url: 'https://scholarship.up.gov.in',
          category: 'Student Welfare',
          isGovt: true,
          description: 'Pre-Matric and Post-Matric Scholarship Scheme',
          order: 6
        },
        {
          title: 'UP Madhyamik Shiksha Parishad (UPMSP)',
          url: 'https://upmsp.edu.in',
          category: 'Board & Results',
          isGovt: true,
          description: '10th & 12th Board Results, Model Papers & Admit Cards',
          order: 7
        },
        {
          title: 'Sarkari Result Direct Portal',
          url: 'https://www.sarkariresult.com',
          category: 'Job Aggregator',
          isGovt: false,
          description: 'Latest Jobs, Results, Admit Cards & Answer Keys',
          order: 8
        }
      ];

      await WebsiteShortcut.insertMany(defaultShortcuts);
      console.log('✅ Official website shortcuts seeded.');
    }

    console.log('🌟 Initial data seeding completed successfully for Shree Online Mahuli.');
  } catch (err) {
    console.error('Data seeding warning:', err.message);
  }
}

module.exports = { seedInitialData };
