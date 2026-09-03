import { Response, NextFunction } from 'express';
import { exportService } from '../services/exportService';
import { AuthRequest } from '../middleware/authenticate';

export const exportController = {
  async exportCSV(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const csv = await exportService.exportTransactionsCSV(req.user!.id);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=finora_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
      res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  },

  async exportJSON(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await exportService.exportFullUserDataJSON(req.user!.id);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=finora_backup_${new Date().toISOString().slice(0, 10)}.json`);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  },

  async getReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const period = (req.query.period as string) || 'this-month';
      const report = await exportService.getFinancialReport(req.user!.id, period);
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (err) {
      next(err);
    }
  },
};
