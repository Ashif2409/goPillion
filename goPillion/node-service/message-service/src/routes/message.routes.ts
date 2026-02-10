import { Router } from "express";
import {
  sendMessageController,
  getTripMessagesController,
} from "../controller/message.controller";
import { authMiddleware } from "../middleware/middleware"

const router = Router();

/**
 * Send a message (driver ↔ passenger)
 */
router.post(
  "/messages",
  authMiddleware,          // sets req.user
  sendMessageController
);

/**
 * Get chat history for a trip
 */
router.get(
  "/trips/:tripId/messages",
  authMiddleware,
  getTripMessagesController
);

export default router;
