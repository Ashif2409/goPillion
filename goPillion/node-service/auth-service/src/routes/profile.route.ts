import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
const { getProfileController,updateProfileController } = require('../controllers/profile.controller');
const router = express.Router();


/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 profile:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/",authMiddleware, getProfileController);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               role:
 *                 type: string
 *                 enum: [USER, DRIVER, ADMIN]
 *                 example: "DRIVER"
 *               name:
 *                 type: string
 *                 example: "Md Khalilul Rahman"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               profile:
 *                 id: 12
 *                 mobile: "9876543210"
 *                 role: "DRIVER"
 *                 name: "Md Khalilul Rahman"
 *       400:
 *         description: Nothing to update or invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.put("/",authMiddleware, updateProfileController);

export const profileRoutes = router;