import mongoose from 'mongoose';
import env from './env.js';

let isConnected = false;

/**
 * Connect to MongoDB with retry and error reporting
 */
export async function connectDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  const options = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  };

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, options);
    isConnected = true;
    console.log(`✅ [MongoDB] Connected to database: ${conn.connection.name} @ ${conn.connection.host}`);
    return conn;
  } catch (err) {
    isConnected = false;
    console.error(`❌ [MongoDB] Connection error: ${err.message}`);
    console.warn('⚠️ [MongoDB] The API will start, but database-backed endpoints will be unavailable until MongoDB is connected.');
    return null;
  }
}

mongoose.connection.on('connected', () => {
  isConnected = true;
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️ [MongoDB] Disconnected from database.');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error(`❌ [MongoDB] Runtime error: ${err.message}`);
});

/**
 * Returns database health and state for health check endpoint
 */
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
  };
}

export default connectDB;
