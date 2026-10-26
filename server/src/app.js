import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import env from './config/env.js';
import healthRoutes from './routes/healthRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.IS_PROD ? 'combined' : 'dev'));
}

// Global Rate Limiter
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP. Please try again later.',
    },
  },
});
app.use('/api', limiter);

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Base Health Routes
app.use('/health', healthRoutes);
app.use('/api/v1/health', healthRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'FoodBridge REST API',
    version: '1.0.0',
    documentation: '/docs',
    health: '/api/v1/health',
  });
});

// Future API routes will be mounted under /api/v1/...

// Handle unknown routes
app.use(notFoundHandler);

// Central error handler
app.use(errorHandler);

export default app;
