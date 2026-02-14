import { Request, Response } from "express";
import { Message } from "../model/message.model"; // Assuming your Mongoose model
import { chatProducer } from "../kafka/kafka.producer";

export const sendMessageController = async (req: Request, res: Response) => {
  try {
    const { tripId, receiverId, text } = req.body;
    const senderId = req.user?.userId; 
    console.log("Received message send request:", { tripId, senderId, receiverId, text });
    if (!tripId || !receiverId || !text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1. Persistence: Save to MongoDB
    const newMessage = await Message.create({
      tripId,
      senderId,
      receiverId,
      text,
      read: false,
    });

    // 2. Real-time: Publish to Kafka
    // The Notification Service will consume this and push via WebSocket
    await chatProducer.sendChatMessage(receiverId, newMessage);

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ message: "Failed to send message" });
  }
};

// Standard endpoint to load chat history
export const getTripMessagesController = async (req: Request, res: Response) => {
    const { tripId } = req.params;
    const messages = await Message.find({ tripId }).sort({ createdAt: 1 });
    return res.status(200).json(messages);
};