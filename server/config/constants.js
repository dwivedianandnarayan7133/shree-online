const path = require('path');
const os = require('os');
const fs = require('fs');

const isServerless = true; // Forced true for persistent MongoDB Buffer storage to bypass ephemeral cloud disks
const baseUploadDir = isServerless 
  ? path.join(os.tmpdir(), 'shree_uploads') 
  : path.join(__dirname, '../uploads');

const UPLOAD_PATHS = {
  BASE: baseUploadDir,
  TEMP: path.join(baseUploadDir, 'temp'),
  PROCESSED: path.join(baseUploadDir, 'processed'),
  CUSTOMER: path.join(baseUploadDir, 'customer_records')
};

// Ensure directories exist safely
try {
  fs.mkdirSync(UPLOAD_PATHS.TEMP, { recursive: true });
  fs.mkdirSync(UPLOAD_PATHS.PROCESSED, { recursive: true });
  fs.mkdirSync(UPLOAD_PATHS.CUSTOMER, { recursive: true });
} catch (e) {
  // Ignore in read-only setups where tempdir is managed per invocation
}

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://ananddev:PpxXIVSYPILYgBWf@cluster0.ovdb4wk.mongodb.net/cybercafe_portal?retryWrites=true&w=majority',
  JWT_SECRET: process.env.JWT_SECRET || 'cybercafe_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: '7d',
  RETENTION_HOURS: 24,
  MAX_FILE_SIZE_MB: 50,
  PORTAL_NAME: 'Shree Online (Mahuli, S.K.N)',
  IS_SERVERLESS: isServerless,
  UPLOAD_PATHS
};
