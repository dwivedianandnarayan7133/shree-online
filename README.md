# Shree Online (Mahuli, S.K.N) — Digital Service & Cyber Cafe Management Portal

> **“One Window. Every Digital Service.”**
> Professional, secure, all-in-one Cyber Cafe & CSC Management Portal for **Shree Online, Mahuli, Sant Kabir Nagar (S.K.N)** built with React.js (**100% Pure Vanilla CSS**), Node.js, Express, MongoDB, Sharp, PDF-Lib, Tesseract.js OCR, Docx, ExcelJS, and Socket.IO.

---

## 🚀 Key Features

### 1. In-Portal Multi-Tab Custom Web Gateway
- **Zero Host Browser Breakouts**: Neutralizes framebusting scripts (`top.location`, `window.top.location = ...`) and rewrites `<a target="_blank">` to keep all links and form submissions operating 100% inside the in-portal browser window.
- **Automated Zlib Stream Decompression**: Decompresses `gzip`, `deflate`, and `brotli` HTTP payload streams from upstream servers.
- **Protocol Fallback**: Automatically falls back from HTTPS to HTTP for legacy Indian government and state portal servers (UPSSSC, SSC, NIC, UP MSP).
- **AdShield™ Property Engine**: Blocks intrusive Google AdSense banners, popups, and tracker scripts for a 3.2x faster, cleaner form-filling experience.
- **Clear Cache & History Suite**: 1-click purge of browser cookies, cached HTML, and navigation history.

### 2. WhatsApp OTP Service & Instant Verification
- **Dual WhatsApp Helplines**:
  - **Desk 1 (Primary)**: `+91 9161400719` *(Mahuli Main Counter)*
  - **Desk 2 (Helpline)**: `+91 8090794210` *(Form Filling & Support)*
- **Fast WhatsApp OTP**: 6-digit one-time password verification for customer registration and login.
- **Floating WhatsApp Quick Chat Widget**: Available across all portal pages for instant customer-to-operator messaging.

### 3. A4 Passport Photo Studio
- **Official Exam Background Standards**: High-precision BFS flood-fill background segmentation engine preserving 100% of facial features, skin tones, and hair while replacing the background with:
  - *Sky Blue (SSC / UPSC / NTA Standard - RGB 160, 206, 242)*
  - *Vivid Exam Blue (State Board Standard - RGB 135, 188, 236)*
  - *Clean Studio White (Passport / Visa Standard)*
  - *Light Grey (Visa Standard)*
- **A4 Easy-Cut Grid**: 6 photos per horizontal line, 7 lines per sheet (up to 42 photos total) with comfortable cutting gutters and 4-corner scissor alignment ticks ✂️.
- **Boundary-Clamped Dynamic Zoom (0.8x to 1.6x)**.

### 4. Universal Document Extractor & OCR Studio
- **Multi-Format Extraction**: Directly extracts text and tabular structures from `.pdf`, `.docx`, `.doc`, `.xlsx`, `.xls`, `.csv`, `.txt`, `.json`, `.md` and all image scans (`.jpg`, `.jpeg`, `.png`, `.webp`, `.bmp`, `.tiff`, `.jfif`, `.heic`).
- **Word (.docx) & Excel (.xlsx) Export**: 1-click export of extracted text to Microsoft Word and detected tables to Microsoft Excel.

### 5. Central Operator & Admin Command Center
- **Request Pipeline**: Manage customer applications with live status tracking (`Received ➔ In Progress ➔ Ready for Download`).
- **POS Billing & Thermal Invoices**: Instant receipt generator with `SHREE ONLINE • Mahuli, S.K.N` branding.
- **Automated Retention Cleaner**: Configurable auto-cleanup for temporary files (1 hr, 6 hrs, 24 hrs, 7 days).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Canvas Confetti, **100% Pure Vanilla CSS** (Zero UI Frameworks).
- **Backend**: Node.js, Express, Socket.IO, JWT Authentication, Multer.
- **Image & PDF Processing**: Sharp, PDF-Lib, Tesseract.js, Mammoth, ExcelJS, PDFParse, Archiver.
- **Database**: MongoDB (Mongoose ODM).

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port 27017)

### 1. Clone the repository
```bash
git clone https://github.com/dwivedianandnarayan7133/shree-online-cybercafe-portal.git
cd shree-online-cybercafe-portal
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../client
npm install
```

### 4. Start the Application

**Start Backend Server (Port 5000):**
```bash
cd server
node server.js
```

**Start Frontend Development Server (Port 3000):**
```bash
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Accounts

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@cybercafe.com` | `admin123` | Full Access (Settings, Pricing, Retention, POS) |
| **Desk Operator** | `operator@cybercafe.com` | `operator123` | Request Pipeline, Printing, Digital Tools |
| **Customer / Student** | `customer@cybercafe.com` | `customer123` | Submit Request, Live Tracking, Deliverables |
| **WhatsApp OTP User** | Mobile: `9161400719` | 6-Digit OTP | 1-Click WhatsApp Auth |

---

## 📍 Contact & Support

- **Portal**: Shree Online Digital Seva & CSC Center
- **Location**: Main Market, Mahuli, Sant Kabir Nagar (S.K.N), Uttar Pradesh
- **WhatsApp Desk 1**: `+91 9161400719`
- **WhatsApp Helpline 2**: `+91 8090794210`
