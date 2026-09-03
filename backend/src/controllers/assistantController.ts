import { Response, NextFunction } from 'express';
import { assistantService } from '../services/assistantService';
import { AuthRequest } from '../middleware/authenticate';

export const assistantController = {
  async ask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = req.body.query || '';
      const response = await assistantService.processQuery(req.user!.id, query);
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (err) {
      next(err);
    }
  },
};
