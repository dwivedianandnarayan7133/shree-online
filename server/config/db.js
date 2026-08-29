const mongoose = require('mongoose');
const { MONGO_URI, IS_SERVERLESS } = require('./constants');

// Disable buffering so failed DB connection returns immediate error rather than hanging for 10s
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3500,
      connectTimeoutMS: 3500,
      socketTimeoutMS: 4000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn('Primary MongoDB Atlas Connection notice:', error.message);
    if (!IS_SERVERLESS) {
      try {
        const fallbackConn = await mongoose.connect('mongodb://127.0.0.1:27017/cybercafe_portal', {
          serverSelectionTimeoutMS: 2000
        });
        console.log(`MongoDB Connected (Local Fallback): ${fallbackConn.connection.host}:${fallbackConn.connection.port}/${fallbackConn.connection.name}`);
        return fallbackConn;
      } catch (fallbackErr) {
        console.error('All MongoDB connection attempts failed:', fallbackErr.message);
      }
    }
    return null;
  }
};

module.exports = connectDB;
