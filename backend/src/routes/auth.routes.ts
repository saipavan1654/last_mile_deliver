import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authenticateUser, AuthController.me);

export default router;
