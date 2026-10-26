import Notification from '../models/Notification.js';

/**
 * Get current user's notifications
 */
export async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json({ notifications });
  } catch (err) {
    next(err);
  }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found.',
        },
      });
    }

    return res.status(200).json({ notification });
  } catch (err) {
    next(err);
  }
}

export default {
  getNotifications,
  markAsRead,
};
