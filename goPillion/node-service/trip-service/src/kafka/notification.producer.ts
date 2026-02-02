import { EventTypes } from "../types/event.types";
import { producer } from "./producer";

export interface NotificationEvent {
    type: EventTypes;
    userId: string;
    payload: any;
    timestamp: string;
}

export const publishNotificationEvent = async (event: NotificationEvent) => {
    try {
        await producer.send({
            topic: "notification.events",
            messages: [
                {
                    key: event.userId,
                    value: JSON.stringify(event),
                },
            ],
        });
    } catch (error) {
        console.error("Error publishing notification event:", error);
    }
}