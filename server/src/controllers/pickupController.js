import Pickup from '../models/Pickup.js';
import Donation from '../models/Donation.js';
import DonationRequest from '../models/DonationRequest.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';

/**
 * Assign a volunteer to an approved pickup task
 * (Can be called by Donor, Admin, or Volunteer self-claiming)
 */
export async function assignVolunteer(req, res, next) {
  try {
    const { id } = req.params; // pickupId
    const { volunteerId } = req.body;

    const pickup = await Pickup.findById(id).populate('donationId requestId');
    if (!pickup) {
      return res.status(404).json({
        error: {
          code: 'PICKUP_NOT_FOUND',
          message: 'Pickup record not found.',
        },
      });
    }

    if (pickup.status !== 'unassigned') {
      return res.status(400).json({
        error: {
          code: 'ALREADY_ASSIGNED',
          message: `This pickup is already ${pickup.status}.`,
        },
      });
    }

    // Determine assigned volunteer: specified or the requesting volunteer self-assigning
    const assignedId = req.user.role === 'volunteer' ? req.user._id : volunteerId;
    if (!assignedId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Volunteer ID is required.',
        },
      });
    }

    pickup.volunteerId = assignedId;
    pickup.status = 'assigned';
    pickup.assignedAt = new Date();
    await pickup.save();

    // Notify volunteer if assigned by someone else
    if (assignedId.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: assignedId,
        title: 'New Food Rescue Mission Assigned! 🚚',
        message: `You have been assigned to collect "${pickup.donationId.title}". Check your Volunteer dashboard for details.`,
        type: 'assignment',
        relatedEntityType: 'pickup',
        relatedEntityId: pickup._id,
      });
    }

    return res.status(200).json({
      message: 'Volunteer assigned successfully.',
      pickup,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all pickups assigned to the logged-in Volunteer
 */
export async function getMyPickups(req, res, next) {
  try {
    const pickups = await Pickup.find({ volunteerId: req.user._id })
      .populate({
        path: 'donationId',
        populate: { path: 'donorId', select: 'name organizationName phone' },
      })
      .populate({
        path: 'requestId',
        populate: { path: 'ngoId', select: 'name organizationName address phone' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ pickups });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all unassigned pickups available for volunteers to claim
 */
export async function getAvailablePickups(req, res, next) {
  try {
    const pickups = await Pickup.find({ status: 'unassigned' })
      .populate('donationId')
      .populate({
        path: 'requestId',
        populate: { path: 'ngoId', select: 'name organizationName' },
      })
      .sort({ createdAt: 1 });

    return res.status(200).json({ pickups });
  } catch (err) {
    next(err);
  }
}

/**
 * Volunteer marks pickup as collected from donor
 */
export async function markCollected(req, res, next) {
  try {
    const { id } = req.params;
    const pickup = await Pickup.findById(id).populate('donationId requestId');

    if (!pickup) {
      return res.status(404).json({
        error: {
          code: 'PICKUP_NOT_FOUND',
          message: 'Pickup not found.',
        },
      });
    }

    const isAssigned = pickup.volunteerId?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isAssigned && !isAdmin) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only the assigned volunteer or administrator can confirm food collection.',
        },
      });
    }

    if (pickup.status !== 'assigned') {
      return res.status(400).json({
        error: {
          code: 'INVALID_STATE',
          message: `Cannot mark collected: Pickup is currently in '${pickup.status}' status.`,
        },
      });
    }

    pickup.status = 'picked_up';
    pickup.pickedUpAt = new Date();
    await pickup.save();

    // Update request state
    await DonationRequest.findByIdAndUpdate(pickup.requestId._id, {
      status: 'in_fulfillment',
    });

    // Audit log
    await AuditLog.create({
      actorId: req.user._id,
      action: 'FOOD_COLLECTED',
      entityType: 'pickup',
      entityId: pickup._id,
      details: { donationTitle: pickup.donationId.title },
      ipAddress: req.ip || '',
    });

    return res.status(200).json({
      message: 'Food collection confirmed. Food is now in transit.',
      pickup,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Volunteer or Recipient confirms final delivery to NGO
 */
export async function markDelivered(req, res, next) {
  try {
    const { id } = req.params;
    const pickup = await Pickup.findById(id).populate('donationId requestId');

    if (!pickup) {
      return res.status(404).json({
        error: {
          code: 'PICKUP_NOT_FOUND',
          message: 'Pickup not found.',
        },
      });
    }

    const isAssignedVolunteer = pickup.volunteerId?.toString() === req.user._id.toString();
    const isRecipientNgo = pickup.requestId?.ngoId?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAssignedVolunteer && !isRecipientNgo && !isAdmin) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only the assigned volunteer, recipient NGO, or administrator can confirm delivery.',
        },
      });
    }

    if (pickup.status !== 'picked_up') {
      return res.status(400).json({
        error: {
          code: 'INVALID_STATE',
          message: `Cannot mark delivered: Food must be collected first (current status: '${pickup.status}').`,
        },
      });
    }

    const deliveredDate = new Date();

    pickup.status = 'delivered';
    pickup.deliveredAt = deliveredDate;
    await pickup.save();

    // Mark Request as delivered
    await DonationRequest.findByIdAndUpdate(pickup.requestId._id, {
      status: 'delivered',
    });

    // Mark Donation as completed
    await Donation.findByIdAndUpdate(pickup.donationId._id, {
      status: 'completed',
    });

    // Notify Donor
    await Notification.create({
      userId: pickup.donationId.donorId,
      title: 'Food Delivered Successfully! 🌟',
      message: `Your surplus food donation of "${pickup.donationId.title}" has been delivered safely. Thank you for reducing waste and feeding communities!`,
      type: 'delivery',
      relatedEntityType: 'donation',
      relatedEntityId: pickup.donationId._id,
    });

    // Audit log
    await AuditLog.create({
      actorId: req.user._id,
      action: 'FOOD_DELIVERED',
      entityType: 'pickup',
      entityId: pickup._id,
      details: {
        donationTitle: pickup.donationId.title,
        quantityDelivered: pickup.requestId.requestedQuantity,
        unit: pickup.donationId.unit,
      },
      ipAddress: req.ip || '',
    });

    return res.status(200).json({
      message: 'Delivery confirmed! The food redistribution lifecycle is complete.',
      pickup,
    });
  } catch (err) {
    next(err);
  }
}

export default {
  assignVolunteer,
  getMyPickups,
  getAvailablePickups,
  markCollected,
  markDelivered,
};
