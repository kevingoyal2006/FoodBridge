import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';

/**
 * Authentication Middleware
 * Validates JWT from HttpOnly cookie or Authorization Bearer header
 */
export async function authenticate(req, res, next) {
  let token = req.cookies?.[env.COOKIE_NAME];

  // Optional fallback to Bearer token header
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please log in to proceed.',
      },
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'The user account for this session no longer exists.',
        },
      });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'Your account has been suspended by an administrator.',
        },
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired session token. Please log in again.',
      },
    });
  }
}

/**
 * Role-Based Authorization Middleware
 * Enforces specific role permissions on protected routes
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires one of: ${allowedRoles.join(', ')}.`,
        },
      });
    }

    next();
  };
}

/**
 * Verified NGO Check Middleware
 * Ensures only verified NGO organizations can submit claims
 */
export function requireVerifiedNgo(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required.',
      },
    });
  }

  if (req.user.role !== 'ngo') {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Only registered NGO accounts can perform this action.',
      },
    });
  }

  if (req.user.verificationStatus !== 'verified') {
    return res.status(403).json({
      error: {
        code: 'NGO_NOT_VERIFIED',
        message: `Your NGO account status is '${req.user.verificationStatus}'. An administrator must verify your organization before you can request donations.`,
      },
    });
  }

  next();
}

export default {
  authenticate,
  requireRole,
  requireVerifiedNgo,
};
