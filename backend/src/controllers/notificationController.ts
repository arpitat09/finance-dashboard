import { Response, NextFunction } from 'express';
import { notificationService } from '../services/notificationService';
import { AuthRequest } from '../middleware/authenticate';

export const notificationController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Trigger dynamic system check first
      await notificationService.triggerSystemCheck(req.user!.id);
      const result = await notificationService.listNotifications(req.user!.id);
      res.status(200).json({
        success: true,
        data: result.notifications,
        unreadCount: result.unreadCount,
      });
    } catch (err) {
      next(err);
    }
  },

  async markRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markAsRead(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (err) {
      next(err);
    }
  },

  async markAllRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.markAllAsRead(req.user!.id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.deleteNotification(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  },
};
