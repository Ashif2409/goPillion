import { NotificationModel } from "../schema/notification.schema";
import { isUserOnline, getUserSocket } from "../websocket/socket.store";
import { EventTypes } from "../types/event.types";
import WebSocket from "ws";
import { sendPushNotification } from "./fcm.service";

export const notifyUser = async (
  userId: string,
  type: EventTypes,
  payload: any
) => {
  const title = payload.title || type;
  const body = payload.body || `New update for ${type.replace('_', ' ')}`;

  // 1️⃣ Store notification
  const notification = await NotificationModel.create({
    userId,
    type,
    title,
    body,
    metadata: payload,
    isRead: false,
  });

  // 2️⃣ Send via WebSocket if online, else via FCM
  if (isUserOnline(userId)) {
    const ws = getUserSocket(userId);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        event: type,
        data: notification,
      }));

      // Update delivery status
      await NotificationModel.findByIdAndUpdate(notification._id, {
        "delivery.socket": true
      });
    }
  } else {
    // 3️⃣ Send Push Notification via FCM if user is NOT online
    console.log(`User ${userId} is offline. Sending FCM push notification.`);
    await sendPushNotification(userId, title, body, payload);

    // Update delivery status
    await NotificationModel.findByIdAndUpdate(notification._id, {
      "delivery.push": true
    });
  }

  return notification;
};

