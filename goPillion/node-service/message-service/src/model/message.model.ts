import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    tripId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    text: { type: String, required: true },
    read: { type: Boolean, default: false },
}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);