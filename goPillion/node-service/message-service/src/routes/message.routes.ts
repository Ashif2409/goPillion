import { Router } from "express";
import {
  sendMessageController,
  getTripMessagesController,
} from "../controller/message.controller";
import { authMiddleware } from "../middleware/middleware"

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Messaging between drivers and passengers
 */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message (driver ↔ passenger)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tripId
 *               - receiverId
 *               - text
 *             properties:
 *               tripId:
 *                 type: string
 *               receiverId:
 *                 type: string
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to send message
 */
router.post(
  "/messages",
  authMiddleware,          // sets req.user
  sendMessageController
);

/**
 * @swagger
 * /api/trips/{tripId}/messages:
 *   get:
 *     summary: Get chat history for a trip
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat history fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/trips/:tripId/messages",
  authMiddleware,
  getTripMessagesController
);

export default router;
