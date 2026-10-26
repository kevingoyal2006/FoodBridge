import express from 'express';
import {
  assignVolunteer,
  getMyPickups,
  getAvailablePickups,
  markCollected,
  markDelivered,
} from '../controllers/pickupController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/my', requireRole('volunteer'), getMyPickups);
router.get('/available', requireRole('volunteer', 'admin'), getAvailablePickups);
router.post('/:id/assign', assignVolunteer);
router.patch('/:id/collected', markCollected);
router.patch('/:id/delivered', markDelivered);

export default router;
