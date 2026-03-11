import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Notification } from '../models/Social.model';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 20 } = req.query;
  const notifications = await Notification.find({ recipient: req.user!._id })
    .populate('sender', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((+page - 1) * +limit)
    .limit(+limit);

  const unreadCount = await Notification.countDocuments({ recipient: req.user!._id, isRead: false });
  const total = await Notification.countDocuments({ recipient: req.user!._id });

  res.json({ success: true, notifications, unreadCount, pagination: { page: +page, limit: +limit, total } });
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const { ids } = req.body;
  if (ids && ids.length > 0) {
    await Notification.updateMany(
      { _id: { $in: ids }, recipient: req.user!._id },
      { isRead: true }
    );
  } else {
    await Notification.updateMany({ recipient: req.user!._id }, { isRead: true });
  }
  res.json({ success: true, message: 'Notifications marked as read' });
};
