import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/summary', dashboardController.getSummary);
router.get('/cash-flow', dashboardController.getCashFlow);
router.get('/category-breakdown', dashboardController.getCategoryBreakdown);
router.get('/health-score', dashboardController.getHealthScore);
router.get('/insights', dashboardController.getInsights);

export default router;
