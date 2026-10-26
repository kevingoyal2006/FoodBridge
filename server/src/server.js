import app from './app.js';
import env from './config/env.js';
import { connectDB } from './config/db.js';

let server;

async function startServer() {
  // Connect to MongoDB
  await connectDB();

  server = app.listen(env.PORT, () => {
    console.log(`
=============================================================
  🍲 FoodBridge REST API is running
  -----------------------------------------------------------
  • Environment : ${env.NODE_ENV}
  • Port        : ${env.PORT}
  • Health Check: http://localhost:${env.PORT}/api/v1/health
  • Allowed CORS: ${env.CLIENT_ORIGIN}
=============================================================
    `);
  });
}

// Graceful shutdown handling
function shutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('✅ HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  console.error('❌ [Unhandled Rejection]:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ [Uncaught Exception]:', err);
  process.exit(1);
});

startServer();
