import { NotificationModel } from "../schema/notification.schema";
import { isUserOnline, getUserSocket } from "../websocket/socket.store";
import { EventTypes } from "../types/event.types";
import WebSocket from "ws";

export const notifyUser = async (
  userId: string,
  type: EventTypes,
  payload: any
) => {
  // 1️⃣ Store notification
  const notification = await NotificationModel.create({
    userId,
    type,
    title: payload.title || type,
    body: payload.body || "",
    metadata: payload,
    isRead: false,
  });

  // 2️⃣ Send via WebSocket if online
  if (isUserOnline(userId)) {
    const ws = getUserSocket(userId);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        event: type,
        data: notification,
      }));
    }
  }

  return notification;
};
