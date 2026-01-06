import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { generateRefreshTokenController, verifyTokenController } from '../controllers/token.controller';

const router = express.Router();
router.post("/refresh-token", authMiddleware, generateRefreshTokenController);
router.post("/verify-token", verifyTokenController);

export const tokenRoutes = router;