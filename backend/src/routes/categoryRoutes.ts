import { Router } from 'express';
import { categoryController } from '../controllers/categoryController';
import { authenticate } from '../middleware/authenticate';
import { validateBody } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../validators';

const router = Router();
router.use(authenticate);

router.get('/', categoryController.list);
router.post('/', validateBody(createCategorySchema), categoryController.create);
router.put('/:id', validateBody(updateCategorySchema), categoryController.update);
router.delete('/:id', categoryController.delete);

export default router;
