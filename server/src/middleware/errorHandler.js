import env from '../config/env.js';

/**
 * 404 Not Found Middleware
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} not found on this server.`,
    },
  });
}

/**
 * Centralized Error Handling Middleware
 * Adheres to TRD standardized error response format.
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  const response = {
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.',
    },
  };

  if (err.details) {
    response.error.details = err.details;
  }

  // Include stack trace only in non-production environments
  if (!env.IS_PROD && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

export default errorHandler;
