const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim(), 'utf8');
  console.log(`Created: ${relPath}`);
}

// 1. config/constants.js
writeFile('server/config/constants.js', `
module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cybercafe_portal',
  JWT_SECRET: process.env.JWT_SECRET || 'cybercafe_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: '7d',
  RETENTION_HOURS: 24,
  MAX_FILE_SIZE_MB: 50,
  UPLOAD_PATHS: {
    TEMP: path.join(__dirname, '../uploads/temp'),
    PROCESSED: path.join(__dirname, '../uploads/processed'),
    CUSTOMER: path.join(__dirname, '../uploads/customer_records')
  }
};
`);

// 2. config/db.js
writeFile('server/config/db.js', `
const mongoose = require('mongoose');
const { MONGO_URI } = require('./constants');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(\`MongoDB Connected: \${conn.connection.host}:\${conn.connection.port}/\${conn.connection.name}\`);
    return conn;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    throw error;
  }
};

module.exports = connectDB;
`);

// 3. utils/idGenerator.js
writeFile('server/utils/idGenerator.js', `
function generateRequestId() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return \`CA-\${year}-\${randomNum}\`;
}

function generateInvoiceId() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return \`INV-\${year}-\${randomNum}\`;
}

function generatePrintJobId() {
  const random = Math.floor(10000 + Math.random() * 90000);
  return \`PRN-\${random}\`;
}

module.exports = {
  generateRequestId,
  generateInvoiceId,
  generatePrintJobId
};
`);

console.log('Base config and utils built!');
