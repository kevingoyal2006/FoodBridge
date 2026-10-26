import express from 'express';
import {
  getMyRequests,
  approveRequest,
  rejectRequest,
} from '../controllers/requestController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/my', requireRole('ngo'), getMyRequests);
router.patch('/:id/approve', requireRole('donor', 'admin'), approveRequest);
router.patch('/:id/reject', requireRole('donor', 'admin'), rejectRequest);

export default router;
