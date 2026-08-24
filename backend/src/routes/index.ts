import { Router } from 'express';
import authRoutes from './auth.routes';
import orderRoutes from './order.routes';
import agentRoutes from './agent.routes';
import zoneRoutes from './zone.routes';
import rateCardRoutes from './rateCard.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/agents', agentRoutes);
router.use('/zones', zoneRoutes);
router.use('/rate-cards', rateCardRoutes);
router.use('/admin', adminRoutes);

// Healthcheck endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
