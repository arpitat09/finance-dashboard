import { Router } from 'express';
import { goalController } from '../controllers/goalController';
import { authenticate } from '../middleware/authenticate';
import { validateBody } from '../middleware/validate';
import { createGoalSchema, updateGoalSchema, contributeGoalSchema } from '../validators';

const router = Router();
router.use(authenticate);

router.get('/', goalController.list);
router.post('/', validateBody(createGoalSchema), goalController.create);
router.put('/:id', validateBody(updateGoalSchema), goalController.update);
router.post('/:id/contribute', validateBody(contributeGoalSchema), goalController.contribute);
router.delete('/:id', goalController.delete);

export default router;
