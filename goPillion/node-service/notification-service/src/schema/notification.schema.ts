import { Schema, model } from "mongoose";
import { EventTypes } from "../types/event.types";

const notificationSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true, // 🔥 important for querying user notifications
    },

    type: {
      type: String,
      required: true,
      enum: Object.values(EventTypes),
    },

    title: {
      type: String,
      required: true,
    },

    body: {
      type: String,
      required: true,
    },

    metadata: {
      tripId: { type: String },
      chatId: { type: String },
      driverId: { type: String },
      otp: { type: String },
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    delivery: {
      socket: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true, // ✅ replaces createdAt manually
  }
);

export const NotificationModel = model("Notification", notificationSchema);
