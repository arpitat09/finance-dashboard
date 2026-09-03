import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/overview', analyticsController.getOverview);

export default router;
