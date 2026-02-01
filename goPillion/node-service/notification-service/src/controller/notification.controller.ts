import { Request, Response } from "express";
import { NotificationModel } from "../schema/notification.schema";

/**
 * GET /notifications
 */
export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notifications = await NotificationModel.find({ userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PATCH /notifications/read
 * Mark all notifications as read
 */
export const markNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await NotificationModel.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Mark read error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /notifications/:id
 */
export const deleteNotificationById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const deleted = await NotificationModel.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /notifications
 */
export const deleteAllNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await NotificationModel.deleteMany({ userId });

    return res.status(200).json({ message: "All notifications deleted" });
  } catch (error) {
    console.error("Delete all notifications error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
