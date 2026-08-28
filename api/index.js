const app = require('../server/app');
const connectDB = require('../server/config/db');

let isConnected = false;

module.exports = async (req, res) => {
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
