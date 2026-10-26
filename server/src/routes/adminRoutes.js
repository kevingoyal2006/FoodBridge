import express from 'express';
import { 
  getUsers, 
  verifyNgo, 
  updateUserStatus, 
  getAuditLogs 
} from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireRole('admin'));

router.get('/users', getUsers);
router.patch('/users/:id/verification', verifyNgo);
router.patch('/users/:id/status', updateUserStatus);
router.get('/audit-logs', getAuditLogs);

export default router;
