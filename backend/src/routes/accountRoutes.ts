import { Router } from 'express';
import { accountController } from '../controllers/accountController';
import { authenticate } from '../middleware/authenticate';
import { validateBody } from '../middleware/validate';
import { createAccountSchema, updateAccountSchema } from '../validators';

const router = Router();
router.use(authenticate);

router.get('/', accountController.list);
router.get('/:id', accountController.getById);
router.post('/', validateBody(createAccountSchema), accountController.create);
router.put('/:id', validateBody(updateAccountSchema), accountController.update);
router.delete('/:id', accountController.delete);

export default router;
