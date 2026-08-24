import { Router } from 'express';
import { ZoneController } from '../controllers/ZoneController';
import { authenticateUser } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { Role } from '@prisma/client';

const router = Router();

// Public / open query for zones & areas when building orders
router.get('/', ZoneController.getZones);

// Admin-only modification endpoints
router.use(authenticateUser);
router.use(requireRole(Role.ADMIN));

router.post('/', ZoneController.createZone);
router.patch('/:id', ZoneController.updateZone);
router.post('/areas', ZoneController.createArea);
router.patch('/areas/:areaId/zone', ZoneController.updateAreaZone);

export default router;
