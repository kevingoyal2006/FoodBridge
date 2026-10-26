import express from 'express';
import {
  createDonation,
  getDonations,
  getDonationById,
  getMyDonations,
  cancelDonation,
} from '../controllers/donationController.js';
import { createRequest, getDonationRequests } from '../controllers/requestController.js';
import { authenticate, requireRole, requireVerifiedNgo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Authenticated browse
router.get('/', getDonations);
router.get('/my', authenticate, requireRole('donor'), getMyDonations);
router.get('/:id', getDonationById);

// Donor actions
router.post('/', authenticate, requireRole('donor'), createDonation);
router.patch('/:id/cancel', authenticate, requireRole('donor', 'admin'), cancelDonation);

// Requests on this donation
router.post('/:id/requests', authenticate, requireVerifiedNgo, createRequest);
router.get('/:id/requests', authenticate, requireRole('donor', 'admin'), getDonationRequests);

export default router;
