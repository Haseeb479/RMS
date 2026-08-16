import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

export const listNotifications = async (req: Request, res: Response) => {
  try {
    const data = await NotificationService.listNotifications(req.companyId!);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await NotificationService.markAsRead(id as string, req.companyId!);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    await NotificationService.markAllAsRead(req.companyId!);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
