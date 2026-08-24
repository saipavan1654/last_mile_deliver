import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticateUser } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateUser);
router.use(requireRole(Role.ADMIN));

router.get('/dashboard', AdminController.getDashboard);
router.get('/orders', AdminController.getOrders);
router.get('/customers', AdminController.getCustomers);
router.get('/agents', AdminController.getAgents);

export default router;
