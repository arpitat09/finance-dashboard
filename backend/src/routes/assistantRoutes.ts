import { Router } from 'express';
import { assistantController } from '../controllers/assistantController';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.post('/ask', assistantController.ask);

export default router;
