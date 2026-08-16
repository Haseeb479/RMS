import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notification.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', listNotifications);
router.patch('/:id/read', markAsRead);
router.post('/read-all', markAllAsRead);

export default router;
