import { Router } from 'express';
import { transactionController } from '../controllers/transactionController';
import { authenticate } from '../middleware/authenticate';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createTransactionSchema,
  updateTransactionSchema,
  queryTransactionsSchema,
} from '../validators';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(queryTransactionsSchema), transactionController.list);
router.get('/:id', transactionController.getById);
router.post('/', validateBody(createTransactionSchema), transactionController.create);
router.put('/:id', validateBody(updateTransactionSchema), transactionController.update);
router.delete('/:id', transactionController.delete);

export default router;
