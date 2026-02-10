import { Kafka, Producer } from "kafkajs";

class ChatProducer {
  private producer: Producer;
  private isConnected: boolean = false;

  constructor() {
    const kafka = new Kafka({
      clientId: "message-service",
      brokers: (process.env.KAFKA_BROKERS || "kafka:9092").split(","),
    });

    this.producer = kafka.producer();
  }

  async connect() {
    if (!this.isConnected) {
      try {
        await this.producer.connect();
        this.isConnected = true;
        console.log("✅ Message Service Producer connected to Kafka");
      } catch (error) {
        console.error("❌ Kafka Producer Connection Error:", error);
      }
    }
  }

  async sendChatMessage(receiverId: string, messagePayload: any) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      await this.producer.send({
        topic: "chat-messages", // Matches your notification service consumer topic
        messages: [
          {
            value: JSON.stringify({
              receiverId,
              payload: messagePayload, // The actual message object
            }),
          },
        ],
      });
      console.log(`📨 Chat event sent to Kafka for receiver: ${receiverId}`);
    } catch (error) {
      console.error("❌ Failed to send chat message to Kafka:", error);
      // Optional: Logic to handle failure (e.g., retry queue)
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await this.producer.disconnect();
      this.isConnected = false;
      console.log("🛑 Message Service Producer disconnected");
    }
  }
}

export const chatProducer = new ChatProducer();