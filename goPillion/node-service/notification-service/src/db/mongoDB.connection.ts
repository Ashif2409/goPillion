import mongoose from 'mongoose';
const mongoURI = process.env.NOTIFICATION_MONGO_URI || 'mongodb://localhost:27017/notification-service';

export const connectToMongoDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

