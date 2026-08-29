const mongoose = require('mongoose');
const { MONGO_URI } = require('./constants');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn('Primary MongoDB Connection notice, trying local fallback:', error.message);
    try {
      const fallbackConn = await mongoose.connect('mongodb://127.0.0.1:27017/cybercafe_portal', {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`MongoDB Connected (Local Fallback): ${fallbackConn.connection.host}:${fallbackConn.connection.port}/${fallbackConn.connection.name}`);
      return fallbackConn;
    } catch (fallbackErr) {
      console.error('All MongoDB connection attempts failed:', fallbackErr.message);
      throw error;
    }
  }
};

module.exports = connectDB;
