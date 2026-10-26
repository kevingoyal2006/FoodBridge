import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory first, fallback to root if exists
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Validates and normalizes environment variables at boot time.
 * Prevents starting the server with invalid or insecure configurations.
 */
function validateEnv() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProd = nodeEnv === 'production';

  const port = parseInt(process.env.PORT || '5000', 10);
  if (Number.isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`[Config Error] PORT must be a valid port number (1-65535). Received: ${process.env.PORT}`);
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodbridge';
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    throw new Error('[Config Error] MONGODB_URI must be a valid MongoDB connection string starting with mongodb:// or mongodb+srv://');
  }

  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

  let jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    if (isProd) {
      throw new Error('[Config Error] JWT_SECRET is required in production.');
    }
    console.warn('⚠️ [Config Warning] JWT_SECRET is not set. Using default development secret. Do NOT use in production!');
    jwtSecret = 'dev_only_jwt_secret_foodbridge_super_secure_2026';
  } else if (jwtSecret.length < 16) {
    throw new Error('[Config Error] JWT_SECRET must be at least 16 characters long for security.');
  }

  const cookieSecure = process.env.COOKIE_SECURE !== undefined
    ? process.env.COOKIE_SECURE === 'true'
    : isProd;

  return {
    NODE_ENV: nodeEnv,
    IS_PROD: isProd,
    PORT: port,
    MONGODB_URI: mongoUri,
    CLIENT_ORIGIN: clientOrigin,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    COOKIE_NAME: process.env.COOKIE_NAME || 'foodbridge_token',
    COOKIE_SECURE: cookieSecure,
    COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || 'lax',
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  };
}

export const env = validateEnv();
export default env;
