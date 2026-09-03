import { Response, NextFunction } from 'express';
import { categoryService } from '../services/categoryService';
import { AuthRequest } from '../middleware/authenticate';

export const categoryController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const type = req.query.type as 'INCOME' | 'EXPENSE' | undefined;
      const categories = await categoryService.listCategories(req.user!.id, type);
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.createCategory(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.updateCategory(req.user!.id, req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await categoryService.deleteCategory(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  },
};
