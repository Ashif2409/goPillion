import { Kafka } from "kafkajs";
import { notifyUser } from "../service/notification.service";
import { EventTypes } from "../types/event.types";

const kafka = new Kafka({
    clientId: "notification-service",
    brokers: (process.env.KAFKA_BROKERS || "kafka:9092").split(","),
});

const consumer = kafka.consumer({ groupId: "notification-group" });

export const startKafkaConsumer = async () => {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: "notification.events", fromBeginning: true });

        console.log("Kafka Consumer connected and subscribed to notification.events");

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    if (!message.value) return;

                    const eventData = JSON.parse(message.value.toString());
                    console.log(`Received Kafka message from ${topic}:`, eventData);

                    const { type, userId, payload } = eventData;

                    if (type && userId) {
                        await notifyUser(userId, type as EventTypes, payload);
                    }
                } catch (error) {
                    console.error("Error processing Kafka message:", error);
                }
            },
        });
    } catch (error) {
        console.error("Error starting Kafka consumer:", error);
    }
};

export const stopKafkaConsumer = async () => {
    try {
        await consumer.disconnect();
        console.log("Kafka Consumer disconnected");
    } catch (error) {
        console.error("Error stopping Kafka consumer:", error);
    }
};
