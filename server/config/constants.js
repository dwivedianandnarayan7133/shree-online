const path = require('path');

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cybercafe_portal',
  JWT_SECRET: process.env.JWT_SECRET || 'cybercafe_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: '7d',
  RETENTION_HOURS: 24,
  MAX_FILE_SIZE_MB: 50,
  PORTAL_NAME: 'Shree Online (Mahuli, S.K.N)',
  UPLOAD_PATHS: {
    TEMP: path.join(__dirname, '../uploads/temp'),
    PROCESSED: path.join(__dirname, '../uploads/processed'),
    CUSTOMER: path.join(__dirname, '../uploads/customer_records')
  }
};
