import express from 'express';
import { getAllNotifications, markNotificationsAsRead, deleteNotificationById, deleteAllNotifications } from '../controller/notification.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: WebSockets
 *   description: Real-time communication via WebSockets (Drivers & Passengers)
 */

/**
 * @swagger
 * /ws:
 *   get:
 *     summary: WebSocket Connection Information
 *     description: |
 *       Connect to the notification service via WebSocket for real-time updates.
 *       
 *       **Endpoint**: `ws://localhost:3003` (or via Gateway)
 *       
 *       **Authentication**:
 *       - Requires **Bearer Token** in `Authorization` header  
 *         `Authorization: Bearer <JWT_TOKEN>`
 *       - Alternatively, token can be sent as query param or cookie (if enabled).
 *       
 *       ### Events Received by Client:
 *       - `RIDE_REQUESTED`: Sent to drivers when a rider requests a trip.
 *       - `RIDE_ACCEPTED`: Sent to rider when a driver accepts.
 *       - `DRIVER_ARRIVED`: Sent to rider when driver is at pickup.
 *       - `OTP`: Sent to rider for trip start verification.
 *       - `TRIP_STARTED` / `TRIP_COMPLETED`: Status updates.
 *       
 *       ### Messages Sent by Client:
 *       - Standard JSON: `{ "event": "...", "data": { ... } }`
 *     tags: [WebSockets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       101:
 *         description: Switching Protocols (WebSocket)
 */


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