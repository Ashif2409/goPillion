import { Kafka } from "kafkajs";
import { notifyUser } from "../service/notification.service";
import { EventTypes } from "../types/event.types";
import { getUserSocket } from "../websocket/socket.store";

/* -------------------- Kafka Client -------------------- */
const kafka = new Kafka({
  clientId: "notification-service",
  brokers: (process.env.KAFKA_BROKERS || "kafka:9092").split(","),
});

/* ---------------- Notification Consumer ---------------- */
const notificationConsumer = kafka.consumer({
  groupId: "notification-group",
});

export const startNotificationConsumer = async () => {
  await notificationConsumer.connect();
  await notificationConsumer.subscribe({
    topic: "notification.events",
    fromBeginning: true,
  });

  console.log("✅ Notification consumer subscribed");

  await notificationConsumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) return;

      try {
        const { type, userId, payload } = JSON.parse(
          message.value.toString()
        );

        if (type && userId) {
          await notifyUser(userId, type as EventTypes, payload);
        }
      } catch (err) {
        console.error("❌ Notification consumer error", err);
      }
    },
  });
};

export const stopNotificationConsumer = async () => {
  await notificationConsumer.disconnect();
  console.log("🛑 Notification consumer stopped");
};

/* -------------------- Chat Consumer -------------------- */
const chatConsumer = kafka.consumer({
  groupId: "notification-group-chat",
});

export const startChatConsumer = async () => {
  await chatConsumer.connect();
  await chatConsumer.subscribe({
    topic: "chat-messages",
    fromBeginning: false,
  });

  console.log("✅ Chat consumer subscribed");

  await chatConsumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      try {
        const { receiverId, payload } = JSON.parse(
          message.value.toString()
        );

        const ws = getUserSocket(receiverId);

        if (ws && ws.readyState === ws.OPEN) {
          ws.send(
            JSON.stringify({
              event: "receive_message",
              data: payload,
            })
          );
        } else {
          console.log("User offline, persist message");
        }
      } catch (err) {
        console.error("❌ Chat consumer error", err);
      }
    },
  });
};

export const stopChatConsumer = async () => {
  await chatConsumer.disconnect();
  console.log("🛑 Chat consumer stopped");
};

/* -------------------- Aggregator -------------------- */
export const startKafkaConsumers = async () => {
  await startNotificationConsumer();
  await startChatConsumer();
};

export const stopKafkaConsumers = async () => {
  await stopNotificationConsumer();
  await stopChatConsumer();
};
