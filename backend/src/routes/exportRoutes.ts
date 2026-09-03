import { Router } from 'express';
import { exportController } from '../controllers/exportController';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/transactions/csv', exportController.exportCSV);
router.get('/backup/json', exportController.exportJSON);
router.get('/report', exportController.getReport);

export default router;
