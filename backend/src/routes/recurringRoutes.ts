import { Router } from 'express';
import { recurringController } from '../controllers/recurringController';
import { authenticate } from '../middleware/authenticate';
import { validateBody } from '../middleware/validate';
import { createRecurringSchema, updateRecurringSchema } from '../validators';

const router = Router();
router.use(authenticate);

router.get('/', recurringController.list);
router.post('/', validateBody(createRecurringSchema), recurringController.create);
router.put('/:id', validateBody(updateRecurringSchema), recurringController.update);
router.delete('/:id', recurringController.delete);
router.post('/process-due', recurringController.processDue);

export default router;
