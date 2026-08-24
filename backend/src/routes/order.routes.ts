import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authenticateUser } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { Role } from '@prisma/client';

const router = Router();

// Price calculation (can be public or authenticated)
router.post('/calculate-price', OrderController.calculatePrice);

// Protected order routes
router.use(authenticateUser);

router.post('/', OrderController.createOrder);
router.get('/', OrderController.getOrders);
router.get('/:id', OrderController.getOrderById);
router.get('/:id/tracking', OrderController.getTracking);
router.patch('/:id/status', OrderController.updateStatus);
router.post('/:id/reschedule', OrderController.rescheduleOrder);
router.post('/:id/assign', requireRole(Role.ADMIN), OrderController.assignAgent);

export default router;
