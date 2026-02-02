import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: "trip-service",
    brokers: [process.env.KAFKA_BROKERS || "localhost:9092"]
})

export const producer = kafka.producer();

export const initKafkaProducer = async () => {
    await producer.connect();
    console.log("Producer connected");
}   