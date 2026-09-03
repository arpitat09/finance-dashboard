import { Response, NextFunction } from 'express';
import { accountService } from '../services/accountService';
import { AuthRequest } from '../middleware/authenticate';

export const accountController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await accountService.listAccounts(req.user!.id);
      res.status(200).json({
        success: true,
        data: result.accounts,
        netWorth: result.netWorth,
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const account = await accountService.getAccountById(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        data: account,
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const account = await accountService.createAccount(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: account,
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const account = await accountService.updateAccount(req.user!.id, req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Account updated successfully',
        data: account,
      });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await accountService.deleteAccount(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  },
};
