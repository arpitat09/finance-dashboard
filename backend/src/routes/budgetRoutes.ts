import { Router } from 'express';
import { budgetController } from '../controllers/budgetController';
import { authenticate } from '../middleware/authenticate';
import { validateBody } from '../middleware/validate';
import { createBudgetSchema, updateBudgetSchema } from '../validators';

const router = Router();
router.use(authenticate);

router.get('/', budgetController.list);
router.post('/', validateBody(createBudgetSchema), budgetController.create);
router.put('/:id', validateBody(updateBudgetSchema), budgetController.update);
router.delete('/:id', budgetController.delete);

export default router;
