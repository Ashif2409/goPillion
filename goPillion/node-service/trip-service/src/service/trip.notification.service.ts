import { publishNotificationEvent } from "../kafka/notification.producer";
import { EventTypes } from "../types/event.types";

const publish = async (type: EventTypes, userId: string, payload: any) => {
    await publishNotificationEvent({
        type,
        userId,
        payload,
        timestamp: new Date().toISOString(),
    });
};

export const notifyRideCreated = async (
    recipientId: string,
    payload: {
        tripId: string;
        senderId: string;
        srcName: string;
        destName: string;
        price: number;
    }
) => {
    await publish(EventTypes.RIDE_CREATED, recipientId, payload);
};
export const notifyRideRequested = async (
    recipientId: string,
    payload: {
        tripId: string;
        senderId: string;
        srcName: string;
        destName: string;
        price: number;
    }
) => {
    await publish(EventTypes.RIDE_REQUESTED, recipientId, payload);
};

export const notifyRideAccepted = async (
    recipientId: string,
    payload: {
        tripId: string;
        driverId?: string;
        passengerId?: string;
        status: string;
    }
) => {
    await publish(EventTypes.RIDE_ACCEPTED, recipientId, payload);
};

export const notifyOtpGenerated = async (
    recipientId: string,
    payload: {
        tripId: string;
        otp: string;
    }
) => {
    await publish(EventTypes.OTP, recipientId, payload);
};

export const notifyRideStarted = async (
    recipientId: string,
    payload: {
        tripId: string;
        startTime: Date;
    }
) => {
    // Re-using RIDE_ACCEPTED or SYSTEM_ALERT since RIDE_STARTED is not in enum
    // Using SYSTEM_ALERT for status updates not strictly "ACCEPTED"
    await publish(EventTypes.SYSTEM_ALERT, recipientId, {
        ...payload,
        message: "Your ride has started!"
    });
};

export const notifyRideCompleted = async (
    recipientId: string,
    payload: {
        tripId: string;
        price: number;
    }
) => {
    await publish(EventTypes.RIDE_COMPLETED, recipientId, payload);
};

export const notifyRideCancelled = async (
    recipientId: string,
    payload: {
        tripId: string;
        reason?: string;
    }
) => {
    await publish(EventTypes.RIDE_CANCELLED, recipientId, payload);
};

export const notifyDriverArrived = async (
    passengerId: string,
    payload: {
        tripId: string;
        driverName?: string;
    }
) => {
    await publish(EventTypes.DRIVER_ARRIVED, passengerId, payload);
};