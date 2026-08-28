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
        portalName: 'Cyber Cafe Management Portal',
        tagline: 'One Window. Every Digital Service.',
        retentionHours: 24,
        adShieldEnabled: true,
        blockMaliciousPopups: true,
        preventRedirects: true,
        cyberCafeName: 'Digital Seva Cyber Point & CSC',
        cyberCafeAddress: 'Shop #12, Near Railway Station, Main Market',
        cyberCafePhone: '+91 98765 43210',
        cyberCafeEmail: 'operator@digitalseva.com',
        defaultCurrency: '₹',
        taxPercent: 0
      });
      console.log('✅ System configuration seeded.');
    }

    // 2. Seed Users (Admin, Operator, Customer)
    const adminExists = await User.findOne({ email: 'admin@cybercafe.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin Manager (Rajesh Kumar)',
        email: 'admin@cybercafe.com',
        password: 'admin123',
        role: 'admin',
        phone: '+91 98111 22334'
      });
      console.log('✅ Admin user created: admin@cybercafe.com / admin123');
    }

    const operatorExists = await User.findOne({ email: 'operator@cybercafe.com' });
    if (!operatorExists) {
      await User.create({
        name: 'Desk Operator (Amit Sharma)',
        email: 'operator@cybercafe.com',
        password: 'operator123',
        role: 'operator',
        phone: '+91 98222 33445'
      });
      console.log('✅ Operator user created: operator@cybercafe.com / operator123');
    }

    let customerUser = await User.findOne({ email: 'customer@cybercafe.com' });
    if (!customerUser) {
      customerUser = await User.create({
        name: 'Pooja Verma (Student)',
        email: 'customer@cybercafe.com',
        password: 'customer123',
        role: 'customer',
        phone: '+91 98333 44556'
      });
      console.log('✅ Customer user created: customer@cybercafe.com / customer123');
    }

    // 3. Seed Service Catalog
    const serviceCount = await ServiceItem.countDocuments();
    if (serviceCount === 0) {
      const services = [
        { name: 'Black & White Document Print', category: 'Printing & Scanning', basePrice: 5, unit: 'per page', description: 'Single-sided laser print', estimatedMinutes: 2, icon: 'Printer' },
        { name: 'Color Glossy / Photo Print', category: 'Printing & Scanning', basePrice: 15, unit: 'per page', description: 'High-resolution photo print', estimatedMinutes: 3, icon: 'Image' },
        { name: 'Passport Photo Sheet (6 Photos)', category: 'Image Tools', basePrice: 50, unit: 'per 4x6 sheet', description: 'Framed passport photo print ready', estimatedMinutes: 5, icon: 'Camera' },
        { name: 'Document High-Res Scanning', category: 'Printing & Scanning', basePrice: 10, unit: 'per scan', description: '300 DPI PDF or JPG scan', estimatedMinutes: 3, icon: 'Scan' },
        { name: 'Old Document Restoration & Cleanup', category: 'Conversion & OCR', basePrice: 60, unit: 'per document', description: 'Contrast enhancement, noise removal, B&W scan mode', estimatedMinutes: 10, icon: 'Sparkles' },
        { name: 'Scanned Image / PDF to Word (.docx)', category: 'Conversion & OCR', basePrice: 25, unit: 'per file', description: 'OCR text extraction & editable docx', estimatedMinutes: 5, icon: 'FileText' },
        { name: 'Scanned Image / PDF to Excel (.xlsx)', category: 'Conversion & OCR', basePrice: 35, unit: 'per file', description: 'OCR table detection & editable xlsx', estimatedMinutes: 7, icon: 'Table' },
        { name: 'PDF Merge / Split / Rotate / Lock', category: 'Document Tools', basePrice: 15, unit: 'per file', description: 'Multi-document merge and extraction', estimatedMinutes: 3, icon: 'Layers' },
        { name: 'Document & PDF Compression (< 200KB)', category: 'Document Tools', basePrice: 10, unit: 'per file', description: 'Portal upload size optimization', estimatedMinutes: 2, icon: 'Minimize2' },
        { name: 'PAN Card New / Correction Assistance', category: 'Govt & CSC Services', basePrice: 150, unit: 'per application', description: 'Online NSDL form filing & biometric slip', estimatedMinutes: 20, icon: 'CreditCard' },
        { name: 'Aadhaar Address / Phone Update Verification', category: 'Govt & CSC Services', basePrice: 50, unit: 'per request', description: 'UIDAI update filing and e-Aadhaar print', estimatedMinutes: 15, icon: 'ShieldCheck' },
        { name: 'Job / Exam Online Application Form Filling', category: 'Govt & CSC Services', basePrice: 100, unit: 'per form', description: 'SSC, UPSC, State PSC, Police, Railways', estimatedMinutes: 25, icon: 'FileEdit' },
        { name: 'Thermal Lamination (A4 / ID)', category: 'Utilities', basePrice: 20, unit: 'per pouch', description: 'High-gauge protective lamination', estimatedMinutes: 4, icon: 'Square' }
      ];
      await ServiceItem.insertMany(services);
      console.log('✅ Service items catalog seeded.');
    }

    // 4. Seed Official Website Shortcuts
    const shortcutCount = await WebsiteShortcut.countDocuments();
    if (shortcutCount === 0) {
      const shortcuts = [
        { title: 'UIDAI Aadhaar Portal', url: 'https://myaadhaar.uidai.gov.in/', category: 'Government Services', description: 'Download e-Aadhaar, check update status & PVC card order', icon: 'ShieldCheck', badge: 'UIDAI Official' },
        { title: 'Income Tax PAN (e-Filing)', url: 'https://eportal.incometax.gov.in/iec/foservices/#/pre-login/instant-e-pan', category: 'Banking & Financial', description: 'Instant e-PAN generation, PAN-Aadhaar linking', icon: 'CreditCard', badge: 'Income Tax' },
        { title: 'NSDL PAN Card Online', url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html', category: 'Banking & Financial', description: 'New PAN Card 49A application & corrections', icon: 'FileText', badge: 'NSDL Official' },
        { title: 'Passport Seva Portal', url: 'https://www.passportindia.gov.in/', category: 'Government Services', description: 'Fresh passport application, appointments & tracking', icon: 'Globe', badge: 'MEA Portal' },
        { title: 'DigiLocker Citizen Portal', url: 'https://www.digilocker.gov.in/', category: 'Government Services', description: 'Verified digital certificates, DL, marksheets', icon: 'FolderCheck', badge: 'DigiLocker' },
        { title: 'NVSP Voter Services Portal', url: 'https://voters.eci.gov.in/', category: 'Government Services', description: 'New voter card (Form 6), correction & EPIC download', icon: 'Vote', badge: 'ECI Official' },
        { title: 'EPFO Member Portal', url: 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/', category: 'Banking & Financial', description: 'PF passbook, KYC update, online claim transfer', icon: 'Building', badge: 'EPFO' },
        { title: 'IRCTC Railway Booking', url: 'https://www.irctc.co.in/nget/', category: 'Railway & Travel', description: 'Train tickets, tatkal booking, PNR status', icon: 'Train', badge: 'IRCTC' },
        { title: 'SSC Examination Portal', url: 'https://ssc.gov.in/', category: 'Education & Exams', description: 'Staff Selection Commission CGL, CHSL, MTS forms', icon: 'GraduationCap', badge: 'SSC' },
        { title: 'UPSC Online Applications', url: 'https://upsconline.nic.in/', category: 'Education & Exams', description: 'Civil Services, NDA, CDS, OTR registration', icon: 'BookOpen', badge: 'UPSC' },
        { title: 'Parivahan Sarathi (DL & RC)', url: 'https://parivahan.gov.in/parivahan/', category: 'Government Services', description: 'Driving license renewal, learner license test, RC transfer', icon: 'Truck', badge: 'MoRTH' },
        { title: 'National Scholarship Portal', url: 'https://scholarships.gov.in/', category: 'Education & Exams', description: 'Pre-matric, post-matric and higher education scholarships', icon: 'Award', badge: 'NSP' },
        { title: 'CSC Digital Seva Portal', url: 'https://digitalseva.csc.gov.in/', category: 'Employment & CSC', description: 'CSC Village Level Entrepreneur digital gateway', icon: 'Briefcase', badge: 'CSC VLE' },
        { title: 'MSME Udyam Registration', url: 'https://udyamregistration.gov.in/', category: 'Government Services', description: 'Zero-cost business registration certificate', icon: 'Store', badge: 'MSME' }
      ];
      await WebsiteShortcut.insertMany(shortcuts);
      console.log('✅ Website shortcuts seeded.');
    }

    // 5. Seed Sample Customer Requests
    const requestCount = await Request.countDocuments();
    if (requestCount === 0) {
      const year = new Date().getFullYear();
      const sampleRequests = [
        {
          requestId: `CA-${year}-104821`,
          customerName: 'Pooja Verma',
          customerPhone: '+91 98333 44556',
          customerEmail: 'pooja.verma@gmail.com',
          customerUser: customerUser ? customerUser._id : null,
          serviceCategory: 'Photo & ID',
          serviceName: 'Passport Photo Sheet (6 Photos)',
          instructions: 'Please generate 6 passport photos with blue background and light cut borders.',
          status: 'completed',
          priority: 'normal',
          totalCost: 50,
          isPaid: true,
          statusHistory: [
            { status: 'new', timestamp: new Date(Date.now() - 3600000 * 5), note: 'Request submitted online.' },
            { status: 'processing', timestamp: new Date(Date.now() - 3600000 * 3), note: 'Framing photo and generating 4x6 print sheet.' },
            { status: 'completed', timestamp: new Date(Date.now() - 3600000 * 1), note: 'Print ready sheet created and ready for pickup/download.' }
          ]
        },
        {
          requestId: `CA-${year}-105932`,
          customerName: 'Rahul Mehra',
          customerPhone: '+91 98765 88990',
          customerEmail: 'rahul.mehra@outlook.com',
          serviceCategory: 'Government Application',
          serviceName: 'PAN Card New / Correction Assistance',
          instructions: 'New PAN Card with Aadhaar address and parent details.',
          status: 'processing',
          priority: 'urgent',
          totalCost: 150,
          isPaid: true,
          statusHistory: [
            { status: 'new', timestamp: new Date(Date.now() - 3600000 * 8), note: 'Documents uploaded by customer.' },
            { status: 'processing', timestamp: new Date(Date.now() - 3600000 * 2), note: 'Form 49A draft filled. Awaiting biometric OTP verification.' }
          ]
        },
        {
          requestId: `CA-${year}-106419`,
          customerName: 'Sunil Gupta',
          customerPhone: '+91 98450 11223',
          customerEmail: 'sunil.gupta@bizcorp.in',
          serviceCategory: 'Conversion & OCR',
          serviceName: 'Scanned Image / PDF to Excel (.xlsx)',
          instructions: 'Extract 3 pages of tabular financial statements into clean Excel spreadsheet.',
          status: 'new',
          priority: 'normal',
          totalCost: 105,
          isPaid: false,
          statusHistory: [
            { status: 'new', timestamp: new Date(Date.now() - 1800000), note: 'Request received from customer portal.' }
          ]
        }
      ];
      await Request.insertMany(sampleRequests);
      console.log('✅ Sample customer requests seeded.');
    }

    // 6. Seed Sample Print Job
    const printJobCount = await PrintJob.countDocuments();
    if (printJobCount === 0) {
      await PrintJob.create({
        jobId: 'PRN-48291',
        title: 'College Admission Form & Marksheets.pdf',
        fileName: 'admission_marksheet.pdf',
        filePath: 'uploads/temp/admission_marksheet.pdf',
        fileSize: 420000,
        copies: 2,
        colorMode: 'bw',
        paperSize: 'A4',
        orientation: 'portrait',
        pageRange: '1-4',
        doubleSided: true,
        customerName: 'Pooja Verma',
        cost: 20,
        status: 'pending'
      });
      console.log('✅ Sample print job seeded.');
    }

    // 7. Seed Sample Invoices
    const invoiceCount = await Invoice.countDocuments();
    if (invoiceCount === 0) {
      const year = new Date().getFullYear();
      await Invoice.create({
        invoiceNumber: `INV-${year}-91024`,
        requestId: `CA-${year}-104821`,
        customerName: 'Pooja Verma',
        customerPhone: '+91 98333 44556',
        items: [
          { description: 'Passport Photo Sheet (6 Photos) - 4x6 Glossy', quantity: 1, unitPrice: 50, total: 50 },
          { description: 'Color Document Print (e-Aadhaar Slip)', quantity: 2, unitPrice: 15, total: 30 }
        ],
        subtotal: 80,
        discount: 10,
        taxPercent: 0,
        taxAmount: 0,
        grandTotal: 70,
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        operatorName: 'Desk Operator (Amit Sharma)'
      });
      console.log('✅ Sample invoice seeded.');
    }

  } catch (err) {
    console.error('Seeder warning:', err.message);
  }
}

module.exports = { seedInitialData };
