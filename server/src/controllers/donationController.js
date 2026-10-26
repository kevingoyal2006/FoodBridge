import Donation from '../models/Donation.js';
import DonationRequest from '../models/DonationRequest.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Create a new surplus food donation (Donor only)
 */
export async function createDonation(req, res, next) {
  try {
    const {
      title,
      description,
      foodCategory,
      foodType = 'vegetarian',
      quantity,
      unit = 'meals',
      pickupDeadline,
      storageInstructions,
      allergenInformation = [],
      pickupAddress,
      city = 'Local',
    } = req.body;

    if (!title || !foodCategory || !quantity || !pickupDeadline || !pickupAddress) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title, food category, quantity, pickup deadline, and pickup address are required.',
        },
      });
    }

    const numQty = parseFloat(quantity);
    if (Number.isNaN(numQty) || numQty <= 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Quantity must be a positive number greater than 0.',
        },
      });
    }

    const deadlineDate = new Date(pickupDeadline);
    if (Number.isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Pickup deadline must be a valid future date and time.',
        },
      });
    }

    const donation = await Donation.create({
      donorId: req.user._id,
      title: title.trim(),
      description: description?.trim() || '',
      foodCategory,
      foodType,
      quantity: numQty,
      quantityAvailable: numQty,
      unit,
      pickupDeadline: deadlineDate,
      storageInstructions: storageInstructions?.trim() || 'Store safely and consume before deadline.',
      allergenInformation: Array.isArray(allergenInformation) ? allergenInformation : [],
      pickupAddress: pickupAddress.trim(),
      city: city.trim(),
      status: 'available',
    });

    await AuditLog.create({
      actorId: req.user._id,
      action: 'DONATION_CREATED',
      entityType: 'donation',
      entityId: donation._id,
      details: { title: donation.title, quantity: donation.quantity, unit: donation.unit },
      ipAddress: req.ip || '',
    });

    return res.status(201).json({
      message: 'Donation successfully published.',
      donation,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Browse available donations with filters and pagination
 * Shields exact address from unverified/general users
 */
export async function getDonations(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '12', 10)));
    const skip = (page - 1) * limit;

    // Filter available and non-expired listings
    const filter = {
      status: 'available',
      pickupDeadline: { $gt: new Date() },
    };

    if (req.query.category && req.query.category !== 'All') {
      filter.foodCategory = req.query.category;
    }

    if (req.query.foodType && req.query.foodType !== 'All') {
      filter.foodType = req.query.foodType;
    }

    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { city: regex },
      ];
    }

    const [total, rawDonations] = await Promise.all([
      Donation.countDocuments(filter),
      Donation.find(filter)
        .populate('donorId', 'name organizationName')
        .sort({ pickupDeadline: 1 }) // Closest deadline first
        .skip(skip)
        .limit(limit),
    ]);

    // Privacy transformation: Shield precise address unless requester is the donor
    const donations = rawDonations.map((d) => {
      const doc = d.toObject();
      const isOwner = req.user && d.donorId?._id?.toString() === req.user._id?.toString();
      if (!isOwner) {
        doc.pickupAddress = `${doc.city} (Exact location revealed after approval)`;
      }
      return doc;
    });

    return res.status(200).json({
      donations,
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
 * Get donation details by ID
 */
export async function getDonationById(req, res, next) {
  try {
    const { id } = req.params;
    const donation = await Donation.findById(id).populate('donorId', 'name organizationName phone');

    if (!donation) {
      return res.status(404).json({
        error: {
          code: 'DONATION_NOT_FOUND',
          message: 'The requested food donation was not found.',
        },
      });
    }

    const doc = donation.toObject();

    // Check if user is permitted to view exact address
    let revealAddress = false;
    if (req.user) {
      const userId = req.user._id.toString();
      if (req.user.role === 'admin' || donation.donorId?._id?.toString() === userId) {
        revealAddress = true;
      } else if (req.user.role === 'ngo') {
        const approvedReq = await DonationRequest.findOne({
          donationId: donation._id,
          ngoId: req.user._id,
          status: { $in: ['approved', 'in_fulfillment', 'delivered'] },
        });
        if (approvedReq) revealAddress = true;
      }
    }

    if (!revealAddress) {
      doc.pickupAddress = `${doc.city} (Exact address revealed after approval)`;
      if (doc.donorId) delete doc.donorId.phone;
    }

    return res.status(200).json({ donation: doc });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all donations created by the current donor
 */
export async function getMyDonations(req, res, next) {
  try {
    const donations = await Donation.find({ donorId: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({ donations });
  } catch (err) {
    next(err);
  }
}

/**
 * Cancel an available donation
 */
export async function cancelDonation(req, res, next) {
  try {
    const { id } = req.params;
    const donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({
        error: {
          code: 'DONATION_NOT_FOUND',
          message: 'Donation not found.',
        },
      });
    }

    // Ownership or admin check
    const isOwner = donation.donorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only cancel your own food donations.',
        },
      });
    }

    if (!['draft', 'available'].includes(donation.status)) {
      return res.status(409).json({
        error: {
          code: 'INVALID_STATE',
          message: `Cannot cancel donation in '${donation.status}' status. It may have already been reserved or completed.`,
        },
      });
    }

    donation.status = 'cancelled';
    donation.quantityAvailable = 0;
    await donation.save();

    await AuditLog.create({
      actorId: req.user._id,
      action: 'DONATION_CANCELLED',
      entityType: 'donation',
      entityId: donation._id,
      details: { title: donation.title },
      ipAddress: req.ip || '',
    });

    return res.status(200).json({
      message: 'Donation has been cancelled.',
      donation,
    });
  } catch (err) {
    next(err);
  }
}

export default {
  createDonation,
  getDonations,
  getDonationById,
  getMyDonations,
  cancelDonation,
};
