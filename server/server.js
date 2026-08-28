const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const { PORT } = require('./config/constants');
const { initSocket } = require('./services/socketService');
const { seedInitialData } = require('./utils/seeder');
const { initCleanupScheduler } = require('./services/cleanupCronService');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Initialize real-time socket events
initSocket(io);

// Start database and server
const startServer = async () => {
  try {
    await connectDB();
    await seedInitialData();
    initCleanupScheduler();

    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Cyber Cafe Management Server running on port ${PORT}`);
      console.log(`🌐 API Endpoint: http://localhost:${PORT}/api/health`);
      console.log(`⚡ Real-time Socket.IO connected`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Fatal Server Startup Error:', err.message);
    process.exit(1);
  }
};

startServer();
