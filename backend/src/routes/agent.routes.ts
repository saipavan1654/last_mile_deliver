import { Router } from 'express';
import { AgentController } from '../controllers/AgentController';
import { authenticateUser } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateUser);
router.use(requireRole(Role.DELIVERY_AGENT));

router.get('/me', AgentController.getMe);
router.patch('/me/availability', AgentController.updateAvailability);
router.patch('/me/location', AgentController.updateLocation);

export default router;
