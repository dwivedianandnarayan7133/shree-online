try {
  require('dotenv').config();
} catch (e) {}

const app = require('../server/app');
const connectDB = require('../server/config/db');

let isConnected = false;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (e) {
      console.warn('DB Connection notice in Serverless environment:', e.message);
    }
  }
  return app(req, res);
};
