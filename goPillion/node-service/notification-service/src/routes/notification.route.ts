import express from 'express';
import { getAllNotifications, markNotificationsAsRead, deleteNotificationById, deleteAllNotifications } from '../controller/notification.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications for user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of notifications }
 */
router.get('/', authMiddleware, getAllNotifications);

/**
 * @swagger
 * /api/notifications/read:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Success }
 */
router.patch('/read', authMiddleware, markNotificationsAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a specific notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Deleted }
 */
router.delete('/:id', authMiddleware, deleteNotificationById);

/**
 * @swagger
 * /api/notifications:
 *   delete:
 *     summary: Delete all notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: All deleted }
 */
router.delete('/', authMiddleware, deleteAllNotifications);

export const notificationRoute = router;