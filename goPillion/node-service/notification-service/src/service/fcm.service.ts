import admin from "firebase-admin";
import { UserTokenModel } from "../schema/userToken.schema";

// Initialize Firebase Admin
// Note: In production, you would typically use a service account JSON file.
// Here we'll allow configuration via environment variables.

const initializeFirebase = () => {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log("Firebase Admin initialized successfully.");
        } else {
            console.warn("FIREBASE_SERVICE_ACCOUNT not found in environment. Push notifications will be disabled.");
        }
    } catch (error) {
        console.error("Error initializing Firebase Admin:", error);
    }
    return;
};


initializeFirebase();

export const sendPushNotification = async (
    userId: string,
    title: string,
    body: string,
    data: any = {}
) => {
    try {
        const userToken = await UserTokenModel.findOne({ userId });
        if (!userToken || !userToken.fcmToken) {
            console.log(`No FCM token found for user ${userId}. Skipping push notification.`);
            return;
        }

        const message = {
            notification: {
                title,
                body,
            },
            data: {
                ...data,
                click_action: "FLUTTER_NOTIFICATION_CLICK", // Standard for many mobile apps
            },
            token: userToken.fcmToken,
        };

        const response = await admin.messaging().send(message);
        console.log(`Push notification sent to user ${userId}:`, response);
        return response;
    } catch (error) {
        console.error(`Error sending push notification to user ${userId}:`, error);
        return error;
    }
};

export const registerFcmToken = async (userId: string, fcmToken: string, deviceType?: string) => {
    try {
        await UserTokenModel.findOneAndUpdate(
            { userId },
            { fcmToken, deviceType: deviceType || "android" },
            { upsert: true, new: true }
        );
        console.log(`FCM token registered/updated for user ${userId}`);
    } catch (error) {
        console.error(`Error registering FCM token for user ${userId}:`, error);
    }
};
