import express from 'express';
import { getDBStatus } from '../config/db.js';
import env from '../config/env.js';

const router = express.Router();

const startTime = Date.now();

/**
 * Health check endpoint
 * Reports API status, uptime, and database connectivity without exposing secrets.
 */
router.get('/', (req, res) => {
  const db = getDBStatus();
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const isHealthy = db.connected;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'FoodBridge REST API',
    version: '1.0.0',
    environment: env.NODE_ENV,
    uptimeSeconds,
    timestamp: new Date().toISOString(),
    database: {
      status: db.status,
      connected: db.connected,
    },
  });
});

export default router;
