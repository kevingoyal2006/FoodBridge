import User from '../models/User.js';
import Donation from '../models/Donation.js';
import DonationRequest from '../models/DonationRequest.js';
import Pickup from '../models/Pickup.js';

/**
 * Returns role-tailored dashboard metrics
 */
export async function getDashboardSummary(req, res, next) {
  try {
    const role = req.user.role;
    const userId = req.user._id;

    let summary = {
      role,
      user: req.user.toSafeObject(),
    };

    if (role === 'donor') {
      const [totalPosted, activeListings, completedDonations] = await Promise.all([
        Donation.countDocuments({ donorId: userId }),
        Donation.countDocuments({ donorId: userId, status: 'available' }),
        Donation.countDocuments({ donorId: userId, status: 'completed' }),
      ]);

      // Calculate quantity delivered grouped by unit
      const completedList = await Donation.find({ donorId: userId, status: 'completed' });
      const quantities = completedList.reduce((acc, curr) => {
        acc[curr.unit] = (acc[curr.unit] || 0) + curr.quantity;
        return acc;
      }, {});

      summary.metrics = {
        totalPosted,
        activeListings,
        completedDonations,
        quantitiesRedistributed: quantities,
      };
    } else if (role === 'ngo') {
      const [totalRequests, pendingRequests, approvedRequests, deliveredRequests] = await Promise.all([
        DonationRequest.countDocuments({ ngoId: userId }),
        DonationRequest.countDocuments({ ngoId: userId, status: 'pending' }),
        DonationRequest.countDocuments({ ngoId: userId, status: { $in: ['approved', 'in_fulfillment'] } }),
        DonationRequest.countDocuments({ ngoId: userId, status: 'delivered' }),
      ]);

      const deliveredList = await DonationRequest.find({ ngoId: userId, status: 'delivered' }).populate('donationId');
      const quantities = deliveredList.reduce((acc, curr) => {
        if (curr.donationId) {
          const unit = curr.donationId.unit;
          acc[unit] = (acc[unit] || 0) + curr.requestedQuantity;
        }
        return acc;
      }, {});

      summary.metrics = {
        verificationStatus: req.user.verificationStatus,
        totalRequests,
        pendingRequests,
        approvedRequests,
        deliveredRequests,
        quantitiesReceived: quantities,
      };
    } else if (role === 'volunteer') {
      const [assignedTasks, completedDeliveries, availableTasks] = await Promise.all([
        Pickup.countDocuments({ volunteerId: userId, status: { $in: ['assigned', 'picked_up'] } }),
        Pickup.countDocuments({ volunteerId: userId, status: 'delivered' }),
        Pickup.countDocuments({ status: 'unassigned' }),
      ]);

      summary.metrics = {
        assignedTasks,
        completedDeliveries,
        availableTasks,
      };
    } else if (role === 'admin') {
      const [
        totalUsers,
        pendingNgos,
        totalDonations,
        activeDonations,
        completedDonations,
        totalPickups,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'ngo', verificationStatus: 'pending' }),
        Donation.countDocuments(),
        Donation.countDocuments({ status: 'available' }),
        Donation.countDocuments({ status: 'completed' }),
        Pickup.countDocuments({ status: 'delivered' }),
      ]);

      summary.metrics = {
        totalUsers,
        pendingNgos,
        totalDonations,
        activeDonations,
        completedDonations,
        completedDeliveries: totalPickups,
      };
    }

    return res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
}

export default {
  getDashboardSummary,
};
