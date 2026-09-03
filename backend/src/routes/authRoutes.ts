import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validateBody } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authLimiter } from '../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);
router.get('/me', authenticate, authController.getMe);
router.patch('/profile', authenticate, validateBody(updateProfileSchema), authController.updateProfile);
router.post('/change-password', authenticate, validateBody(changePasswordSchema), authController.changePassword);

export default router;
