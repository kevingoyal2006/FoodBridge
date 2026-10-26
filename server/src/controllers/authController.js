import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/tokenHelper.js';

/**
 * Register a new user account (donor, ngo, volunteer)
 * Public registration for 'admin' is strictly forbidden.
 */
export async function register(req, res, next) {
  try {
    const { 
      name, 
      email, 
      password, 
      role = 'donor', 
      organizationName, 
      registrationNumber, 
      phone, 
      address 
    } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, email, and password are required fields.',
        },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 6 characters long.',
        },
      });
    }

    // Role check: Admin cannot be registered publicly
    if (role === 'admin') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Administrator accounts cannot be created via public registration.',
        },
      });
    }

    if (!['donor', 'ngo', 'volunteer'].includes(role)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: "Role must be 'donor', 'ngo', or 'volunteer'.",
        },
      });
    }

    // NGO specific validation
    if (role === 'ngo' && !organizationName) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Organization name is required for NGO accounts.',
        },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check email uniqueness
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address already exists.',
        },
      });
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Create user
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      organizationName: organizationName?.trim() || '',
      registrationNumber: registrationNumber?.trim() || '',
      phone: phone?.trim() || '',
      address: address?.trim() || '',
      verificationStatus: role === 'ngo' ? 'pending' : 'not_required',
      accountStatus: 'active',
    });

    // Record audit entry
    await AuditLog.create({
      actorId: newUser._id,
      action: 'USER_REGISTERED',
      entityType: 'user',
      entityId: newUser._id,
      details: { role: newUser.role, email: newUser.email },
      ipAddress: req.ip || '',
    });

    // Establish session
    const token = generateToken(newUser);
    setAuthCookie(res, token);

    return res.status(201).json({
      message: 'Account successfully registered.',
      user: newUser.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Authenticate existing user and establish secure session
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required.',
        },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Query user and explicitly select passwordHash
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
    }

    // Check account status
    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'Your account has been suspended. Please contact administrator.',
        },
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
    }

    // Record audit log
    await AuditLog.create({
      actorId: user._id,
      action: 'USER_LOGIN',
      entityType: 'auth',
      entityId: user._id,
      details: { role: user.role },
      ipAddress: req.ip || '',
    });

    // Generate token and set cookie
    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.status(200).json({
      message: 'Login successful.',
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Log out and clear session cookie
 */
export async function logout(req, res) {
  clearAuthCookie(res);
  return res.status(200).json({
    message: 'Logged out successfully.',
  });
}

/**
 * Return current authenticated user profile
 */
export async function getMe(req, res) {
  return res.status(200).json({
    user: req.user.toSafeObject(),
  });
}

export default {
  register,
  login,
  logout,
  getMe,
};
