import { NotificationModel } from "../schema/notification.schema";
import { isUserOnline, getUserSocketId } from "../websocket/socket.store";
import { EventTypes } from "../types/event.types";


let io: any; // injected socket instance

export const setSocketInstance = (socketIO: any) => {
  io = socketIO;
};

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

  // 2️⃣ WebSocket if online
  if (isUserOnline(userId)) {
    const socketId = getUserSocketId(userId);
    if (socketId) {
      io.to(socketId).emit(type, notification);
    }
  }

  // 3️⃣ FCM later (ignored for now)

  return notification;
};
