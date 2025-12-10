import express from 'express';
import { sendOTPController,verifyOTPController } from '../controllers/otp.controller';

 const router = express.Router();
 
/**
 * @swagger
 * /api/auth/health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is running
 */
router.get("/health", (req, res) => {
  res.json({ status: "OK" });
});


/**
 * @swagger
 * /api/auth/request-otp:
 *   post:
 *     summary: Request OTP to user's mobile number
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "8409253381"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Mobile required
 *       500:
 *         description: Failed to send OTP
 */
router.post("/request-otp", sendOTPController);



/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and authenticate user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *               - otp
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "8409253381"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully (access token returned)
 *       400:
 *         description: Invalid OTP or other validation error
 *       500:
 *         description: Failed to verify OTP
 */
router.post("/verify-otp",verifyOTPController);

export const otpRoutes = router;