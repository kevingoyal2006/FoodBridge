import mongoose from 'mongoose';
import env from './env.js';

let isConnected = false;
let memoryServerInstance = null;

/**
 * Connect to MongoDB with auto in-memory fallback in development
 */
export async function connectDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  const options = {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 5000,
  };

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, options);
    isConnected = true;
    console.log(`✅ [MongoDB] Connected to database: ${conn.connection.name} @ ${conn.connection.host}`);
    return conn;
  } catch (err) {
    isConnected = false;
    console.warn(`⚠️ [MongoDB] Local connection to ${env.MONGODB_URI} failed: ${err.message}`);

    // In development, automatically spin up an embedded in-memory MongoDB instance
    // so evaluation and testing works seamlessly without requiring local mongod service setup.
    if (env.NODE_ENV === 'development') {
      try {
        console.log('🔄 [MongoDB] Starting embedded MongoDB instance & seeding demo accounts for immediate demonstration...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const memUri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(memUri);
        isConnected = true;
        console.log(`✅ [MongoDB Embedded] Connected to in-memory database: ${conn.connection.name}`);

        // Seed initial demo data
        const { seedDatabase } = await import('../../scripts/seed.js');
        await seedDatabase(memUri);
        return conn;
      } catch (memErr) {
        console.error('❌ [MongoDB Embedded Error]:', memErr.message);
      }
    }

    return null;
  }
}

mongoose.connection.on('connected', () => {
  isConnected = true;
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
});

export function getDBStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const readyState = mongoose.connection.readyState;
  return {
    status: states[readyState] || 'unknown',
    connected: readyState === 1,
    database: isConnected ? mongoose.connection.name : null,
    isEmbedded: !!memoryServerInstance,
  };
}

export default connectDB;
