import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: "trip-service",
    brokers: (process.env.KAFKA_BROKERS || "kafka:9092").split(",")
})

export const producer = kafka.producer();

export const initKafkaProducer = async () => {
    try {
        await producer.connect();
        console.log("✅ Trip Service: Kafka Producer connected");
    } catch (error) {
        console.error("❌ Trip Service: Failed to connect Kafka Producer", error);
        // Optional: process.exit(1) if Kafka is critical
    }
}