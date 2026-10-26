import Donation from '../models/Donation.js';
import DonationRequest from '../models/DonationRequest.js';
import Pickup from '../models/Pickup.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Submit a food claim request (Verified NGO only)
 */
export async function createRequest(req, res, next) {
  try {
    const { id: donationId } = req.params;
    const { requestedQuantity, pickupNotes = '' } = req.body;

    const numQty = parseFloat(requestedQuantity);
    if (Number.isNaN(numQty) || numQty <= 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Requested quantity must be a positive number.',
        },
      });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        error: {
          code: 'DONATION_NOT_FOUND',
          message: 'Donation listing not found.',
        },
      });
    }

    if (donation.status !== 'available' || donation.pickupDeadline <= new Date()) {
      return res.status(400).json({
        error: {
          code: 'DONATION_UNAVAILABLE',
          message: 'This donation is no longer available or has expired.',
        },
      });
    }

    if (numQty > donation.quantityAvailable) {
      return res.status(400).json({
        error: {
          code: 'INSUFFICIENT_QUANTITY',
          message: `Requested quantity (${numQty}) exceeds available surplus (${donation.quantityAvailable} ${donation.unit}).`,
        },
      });
    }

    // Check if this NGO already has a pending or approved request for this donation
    const existingReq = await DonationRequest.findOne({
      donationId,
      ngoId: req.user._id,
      status: { $in: ['pending', 'approved', 'in_fulfillment'] },
    });

    if (existingReq) {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_REQUEST',
          message: 'Your organization already has an active request for this food listing.',
        },
      });
    }

    const request = await DonationRequest.create({
      donationId,
      ngoId: req.user._id,
      requestedQuantity: numQty,
      pickupNotes: pickupNotes?.trim() || '',
      status: 'pending',
    });

    // Notify Donor
    await Notification.create({
      userId: donation.donorId,
      title: 'New Donation Request',
      message: `${req.user.organizationName || req.user.name} has requested ${numQty} ${donation.unit} of "${donation.title}".`,
      type: 'request',
      relatedEntityType: 'request',
      relatedEntityId: request._id,
    });

    return res.status(201).json({
      message: 'Donation request submitted successfully.',
      request,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all requests submitted by the logged-in NGO
 */
export async function getMyRequests(req, res, next) {
  try {
    const requests = await DonationRequest.find({ ngoId: req.user._id })
      .populate({
        path: 'donationId',
        populate: { path: 'donorId', select: 'name organizationName phone' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ requests });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all requests received for a specific donation (Donor or Admin)
 */
export async function getDonationRequests(req, res, next) {
  try {
    const { id: donationId } = req.params;
    const donation = await Donation.findById(donationId);

    if (!donation) {
      return res.status(404).json({
        error: {
          code: 'DONATION_NOT_FOUND',
          message: 'Donation not found.',
        },
      });
    }

    const isOwner = donation.donorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only view requests for your own donations.',
        },
      });
    }

    const requests = await DonationRequest.find({ donationId })
      .populate('ngoId', 'name organizationName registrationNumber phone email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ requests });
  } catch (err) {
    next(err);
  }
}

/**
 * Approve an NGO request with atomic single-reservation to prevent double booking
 */
export async function approveRequest(req, res, next) {
  try {
    const { id } = req.params;
    const request = await DonationRequest.findById(id).populate('donationId');

    if (!request) {
      return res.status(404).json({
        error: {
          code: 'REQUEST_NOT_FOUND',
          message: 'Request not found.',
        },
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        error: {
          code: 'INVALID_STATE',
          message: `This request is already ${request.status}.`,
        },
      });
    }

    const donation = request.donationId;
    const isOwner = donation.donorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only the donor or an administrator can approve this request.',
        },
      });
    }

    if (donation.pickupDeadline <= new Date()) {
      return res.status(409).json({
        error: {
          code: 'DONATION_EXPIRED',
          message: 'The pickup deadline for this food listing has passed.',
        },
      });
    }

    // ATOMIC RESERVATION QUERY:
    // Ensures status is still available and quantityAvailable is sufficient
    const updatedDonation = await Donation.findOneAndUpdate(
      {
        _id: donation._id,
        status: 'available',
        quantityAvailable: { $gte: request.requestedQuantity },
      },
      {
        $set: { status: 'reserved' },
        $inc: { quantityAvailable: -request.requestedQuantity },
      },
      { new: true }
    );

    if (!updatedDonation) {
      return res.status(409).json({
        error: {
          code: 'CONCURRENCY_CONFLICT',
          message: 'This donation is no longer available or was already reserved by another request.',
        },
      });
    }

    // Update request state
    request.status = 'approved';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // Automatically create a pickup coordination record
    const pickup = await Pickup.create({
      donationId: donation._id,
      requestId: request._id,
      status: 'unassigned',
    });

    // Automatically reject any other pending requests for this now-reserved donation
    await DonationRequest.updateMany(
      {
        donationId: donation._id,
        _id: { $ne: request._id },
        status: 'pending',
      },
      {
        $set: {
          status: 'rejected',
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
        },
      }
    );

    // Notify NGO
    await Notification.create({
      userId: request.ngoId,
      title: 'Donation Request Approved! 🎉',
      message: `Your request for "${donation.title}" was approved by the donor. Pickup logistics are now active.`,
      type: 'approval',
      relatedEntityType: 'request',
      relatedEntityId: request._id,
    });

    // Record audit
    await AuditLog.create({
      actorId: req.user._id,
      action: 'REQUEST_APPROVED_AND_RESERVED',
      entityType: 'request',
      entityId: request._id,
      details: { donationId: donation._id, requestedQuantity: request.requestedQuantity },
      ipAddress: req.ip || '',
    });

    return res.status(200).json({
      message: 'Request approved and donation reserved successfully.',
      request,
      pickup,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Reject an NGO request
 */
export async function rejectRequest(req, res, next) {
  try {
    const { id } = req.params;
    const request = await DonationRequest.findById(id).populate('donationId');

    if (!request) {
      return res.status(404).json({
        error: {
          code: 'REQUEST_NOT_FOUND',
          message: 'Request not found.',
        },
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        error: {
          code: 'INVALID_STATE',
          message: `Cannot reject request in '${request.status}' state.`,
        },
      });
    }

    const isOwner = request.donationId.donorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only the donor or administrator can reject requests.',
        },
      });
    }

    request.status = 'rejected';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    await Notification.create({
      userId: request.ngoId,
      title: 'Request Update',
      message: `Your request for "${request.donationId.title}" was not approved at this time.`,
      type: 'request',
      relatedEntityType: 'request',
      relatedEntityId: request._id,
    });

    return res.status(200).json({
      message: 'Request has been rejected.',
      request,
    });
  } catch (err) {
    next(err);
  }
}

export default {
  createRequest,
  getMyRequests,
  getDonationRequests,
  approveRequest,
  rejectRequest,
};
