import { Router } from 'express';
import { RateCardController } from '../controllers/RateCardController';
import { authenticateUser } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateUser);
router.use(requireRole(Role.ADMIN));

router.get('/', RateCardController.getRateCards);
router.post('/', RateCardController.createRateCard);
router.patch('/:id', RateCardController.updateRateCard);

router.get('/cod', RateCardController.getCODConfigs);
router.post('/cod', RateCardController.upsertCODConfig);

export default router;
