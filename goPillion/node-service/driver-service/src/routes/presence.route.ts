import express from 'express';
import { authMiddleware } from '../middleware/driver.middleware';
const router = express.Router();
import { toggleOnline, heartbeat } from '../controllers/presence.controller';

/**
 * @swagger
 * tags:
 *   name: Presence
 *   description: Driver online/offline status management
 */

/**
 * @swagger
 * /api/presence/toggle:
 *   post:
 *     summary: Toggle driver online status
 *     description: Toggles the driver between ONLINE and OFFLINE. Requires longitude and latitude when going online.
 *     tags: [Presence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lng:
 *                 type: number
 *                 description: Longitude
 *               lat:
 *                 type: number
 *                 description: Latitude
 *     responses:
 *       200:
 *         description: Successfully toggled status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [ONLINE, OFFLINE]
 */
router.post('/toggle', authMiddleware, toggleOnline);

/**
 * @swagger
 * /api/presence/heartbeat:
 *   post:
 *     summary: Update driver presence heartbeat
 *     description: Refreshes the driver's TTL in the online pool. Should be called periodically.
 *     tags: [Presence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lng:
 *                 type: number
 *               lat:
 *                 type: number
 *     responses:
 *       204:
 *         description: Heartbeat received
 *       404:
 *         description: Driver is offline
 */
router.post('/heartbeat', authMiddleware, heartbeat);

export const presenceRoutes = router;