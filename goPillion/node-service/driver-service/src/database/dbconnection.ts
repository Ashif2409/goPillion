import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: path.resolve(__dirname, '../../.env'),
  });
}

let isConnected = false;

export const connectDB = async () => {
  // Prevent duplicate connections
  if (isConnected) {
    console.log(" MongoDB already connected");
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }
    
    console.log(" Connecting to MongoDB...");
    
    await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    isConnected = true;
    console.log(" MongoDB connected successfully");
    
  } catch (error) {
    console.error(" MongoDB connection failed:", error);
    throw error;
  }
};