import express from 'express';
import { authMiddleware } from '../middleware/driver.middleware';
const router = express.Router();
import { toggleOnline, heartbeat } from '../controllers/presence.controller';

router.post('/toggle',authMiddleware,toggleOnline);
router.post('/heartbeat',authMiddleware,heartbeat);

export const presenceRoutes = router;