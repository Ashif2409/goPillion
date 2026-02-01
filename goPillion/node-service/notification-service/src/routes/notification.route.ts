import express from 'express';
import { getAllNotifications, markNotificationsAsRead, deleteNotificationById, deleteAllNotifications } from '../controller/notification.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/',authMiddleware,getAllNotifications);
router.patch('/read',authMiddleware,markNotificationsAsRead);
router.delete('/:id',authMiddleware,deleteNotificationById);
router.delete('/',authMiddleware,deleteAllNotifications);

export const notificationRoute = router;