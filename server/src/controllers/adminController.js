import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';

/**
 * List all users with pagination and filtering (Admin only)
 */
export async function getUsers(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    if (req.query.verificationStatus) {
      filter.verificationStatus = req.query.verificationStatus;
    }

    if (req.query.accountStatus) {
      filter.accountStatus = req.query.accountStatus;
    }

    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { organizationName: regex },
      ];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-passwordHash'),
    ]);

    res.status(200).json({
      users,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        limit,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Verify or Reject an NGO organization (Admin only)
 */
export async function verifyNgo(req, res, next) {
  try {
    const { id } = req.params;
    const { verificationStatus, notes = '' } = req.body;

    if (!['verified', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: "Verification status must be either 'verified' or 'rejected'.",
        },
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'The requested user was not found.',
        },
      });
    }

    if (user.role !== 'ngo') {
      return res.status(400).json({
        error: {
          code: 'INVALID_ROLE',
          message: 'Only NGO accounts can have their verification status modified.',
        },
      });
    }

    const oldStatus = user.verificationStatus;
    user.verificationStatus = verificationStatus;
    user.verificationNotes = notes;
    await user.save();

    // Create Audit Log
    await AuditLog.create({
      actorId: req.user._id,
      action: 'NGO_VERIFICATION_UPDATED',
      entityType: 'user',
      entityId: user._id,
      details: {
        previousStatus: oldStatus,
        newStatus: verificationStatus,
        notes,
      },
      ipAddress: req.ip || '',
    });

    // Notify the NGO
    await Notification.create({
      userId: user._id,
      title: verificationStatus === 'verified' ? 'Organization Verified!' : 'Verification Application Update',
      message: verificationStatus === 'verified'
        ? 'Congratulations! Your NGO credentials have been verified by an administrator. You can now browse and claim surplus food donations.'
        : `Your NGO verification was rejected. Reason: ${notes || 'Documentation requirements not met.'}`,
      type: 'verification',
      relatedEntityType: 'user',
      relatedEntityId: user._id,
    });

    return res.status(200).json({
      message: `NGO account successfully marked as ${verificationStatus}.`,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Suspend or activate a user account (Admin only)
 */
export async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { accountStatus } = req.body;

    if (!['active', 'suspended'].includes(accountStatus)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: "Account status must be 'active' or 'suspended'.",
        },
      });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Administrators cannot suspend their own account.',
        },
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found.',
        },
      });
    }

    user.accountStatus = accountStatus;
    await user.save();

    await AuditLog.create({
      actorId: req.user._id,
      action: `USER_ACCOUNT_${accountStatus.toUpperCase()}`,
      entityType: 'user',
      entityId: user._id,
      details: { email: user.email, role: user.role },
      ipAddress: req.ip || '',
    });

    return res.status(200).json({
      message: `User account is now ${accountStatus}.`,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get system audit logs (Admin only)
 */
export async function getAuditLogs(req, res, next) {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '25', 10)));
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('actorId', 'name email role');

    res.status(200).json({ logs });
  } catch (err) {
    next(err);
  }
}

export default {
  getUsers,
  verifyNgo,
  updateUserStatus,
  getAuditLogs,
};
