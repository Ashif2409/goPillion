import { Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import { Trip } from "../model/trip.model";
import { generateOtp } from "../utils/generateOtp";
import brcypt from "bcrypt";
import {
    notifyRideCreated,
    notifyRideRequested,
    notifyRideAccepted,
    notifyOtpGenerated,
    notifyRideStarted,
    notifyRideCancelled,
    notifyRideCompleted
} from "../service/trip.notification.service";
import { calculateRidePrice } from "../service/pricing.service";
import { getRouteFromMapService } from "../service/map.http.service";
/**
 * TODO:
 * Replace this with real event bus later (Kafka / Redis / RabbitMQ)
 */
// const eventBus = {
//     publish: (eventName: string, payload: any) => {
//         console.log(`[EVENT EMITTED] ${eventName}`, payload);
//     },
// };

/**
 * =========================
 * CREATE DRIVER POSTED TRIP
 * =========================
 */
export const createTripDriverController = async (req: Request, res: Response) => {
    try {
        const { 
            srcLat, srcLng, destLat, destLng, 
            srcName, destName, tripType, 
            earliestStartTime, latestStartTime, 
            vehicleType, // Get vehicle type (BIKE/SCOOTY)
        } = req.body;

        const driverId = req.user?.userId;
        if (!driverId) return res.status(401).json({ message: "Unauthorized" });

        // Basic Validation
        if (!srcLat || !srcLng || !destLat || !destLng || !srcName || !destName || !tripType || !earliestStartTime) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        // 1. GET ROUTE DETAILS (Map Service)
        // This gets the polyline, distance (km), and duration (min)
        let routeData;
        try {
            routeData = await getRouteFromMapService(srcLat, srcLng, destLat, destLng);
        } catch (err) {
            console.error("Map Service Failed:", err);
            return res.status(500).json({ message: "Could not calculate route. Please try again." });
        }

        // 2. CALCULATE PRICE (Pricing Service)
        // We use the distance from the map to determine the fair price
        const calculated = calculateRidePrice(
            routeData.distanceKm,
            routeData.durationMin,
            vehicleType || "BIKE" // Default to BIKE if not sent
        );

        // Logic: If driver sent a price, use it. Otherwise, use our calculated price.
        const finalPrice =  calculated.price;

        // Time Validation Logic
        const earliest = new Date(earliestStartTime);
        let latest: Date;
        if (tripType === "IMMEDIATE") {
            latest = new Date(earliest.getTime() + 15 * 60 * 1000);
        } else {
            if (!latestStartTime) return res.status(400).json({ message: "latestStartTime required for scheduled trips" });
            latest = new Date(latestStartTime);
            if (latest <= earliest) return res.status(400).json({ message: "latestStartTime must be after earliestStartTime" });
        }

        // 3. CREATE TRIP
        const trip = await Trip.create({
            srcLat, srcLng, destLat, destLng,
            srcName, destName,
            earliestStartTime: earliest,
            latestStartTime: latest,
            tripType,
            tripMode: "DRIVER_POSTED",
            driverId,
            status: "OPEN",
            
            // NEW FIELDS
            vehicleType: vehicleType || "BIKE",
            distance: routeData.distanceKm,
            duration: routeData.durationMin,
            routePolyline: routeData.polyline,
            price: finalPrice
        });

        await notifyRideCreated(driverId, {
            tripId: trip.dataValues.id,
            senderId: driverId,
            srcName, destName,
            price: finalPrice,
        });

        // Remove sensitive/large fields before returning to client
        const tripData: any = trip.toJSON ? trip.toJSON() : trip;
        delete tripData.routePolyline;
        delete tripData.otp;
        delete tripData.otpExpiresAt;

        return res.status(201).json({
            message: "Trip created successfully",
            trip: tripData,
            // Send breakdown so frontend can show "Base Fare: 20, Distance: 5km..."
            priceBreakdown: calculated.breakdown
        });

    } catch (error) {
        console.error("Error creating trip:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * ==========================================
 * GET OPEN PASSENGER-POSTED TRIPS (DASHBOARD)
 * ==========================================
 */
export const getOpenTripsController = async (req: Request, res: Response) => {
    try {
        const { srcLat, srcLng, radiusKm = 5 } = req.query;
        // ... validation ...
        const lat = Number(srcLat);
        const lng = Number(srcLng);

        const openTrips = await Trip.findAll({
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                            6371 * acos(
                                cos(radians(${lat})) *
                                cos(radians("srcLat")) * cos(radians("srcLng") - radians(${lng})) +
                                sin(radians(${lat})) *
                                sin(radians("srcLat"))
                            )
                        )`),
                        'proximity' // <--- CHANGED: Renamed alias
                    ]
                ]
            },
            where: {
                status: "OPEN",
                tripMode: "PASSENGER_POSTED",
                passengerId: { [Op.ne]: null },
                [Op.and]: Sequelize.literal(`(
                    6371 * acos(
                        cos(radians(${lat})) *
                        cos(radians("srcLat")) * cos(radians("srcLng") - radians(${lng})) +
                        sin(radians(${lat})) *
                        sin(radians("srcLat"))
                    )
                ) < ${Number(radiusKm)}`)
            },
            order: [
                [Sequelize.literal('proximity'), 'ASC'], // Sort by proximity
                ["createdAt", "DESC"]
            ],
        });

        return res.status(200).json({ openTrips });
    } catch (error) {
        console.error("Error getting trips:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * =====================
 * GET TRIP BY ID
 * =====================
 */
export const getTripByIdController = async (
    req: Request,
    res: Response
) => {
    try {
        const trip = await Trip.findAll({
            where: {
                id: req.params.id,
                driverId: req.user?.userId
            }
        });

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        return res.status(200).json({ trip });
    } catch (error) {
        console.error("Error getting trip:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * =====================
 * GET MY TRIPS
 * =====================
 */
export const getMyTripsDriverController = async (
    req: Request,
    res: Response
) => {
    try {
        const driverId = req.user?.userId;
        const trips = await Trip.findAll({
            where: {
                driverId,
            },
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({ trips });
    } catch (error) {
        console.error("Error getting trips:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * ====================================
 * DRIVER REQUESTS PASSENGER POSTED TRIP
 * ====================================
 */
export const sendRequestController = async (
    req: Request,
    res: Response
) => {
    try {
        const driverId = req.user?.userId;
        if (!driverId) return res.status(401).json({ message: "Unauthorized" });
        const { id } = req.params;

        const trip = await Trip.findByPk(id);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        if (trip.dataValues.tripMode !== "PASSENGER_POSTED") {
            return res.status(400).json({ message: "Trip is not passenger-posted" });
        }

        if (trip.dataValues.status !== "OPEN") {
            return res.status(400).json({ message: "Trip is not open for requests" });
        }

        await trip.update({
            driverId,
            status: "REQUESTED",
        });

        // Notify passenger
        if (trip.dataValues.passengerId) {
            await notifyRideRequested(trip.dataValues.passengerId, {
                tripId: trip.dataValues.id,
                senderId: driverId,
                srcName: trip.dataValues.srcName,
                destName: trip.dataValues.destName,
                price: trip.dataValues.price
            });
        }

        return res.status(200).json({
            message: "Request sent successfully",
            trip,
        });
    } catch (error) {
        console.error("Error sending request:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getTripRequestIdController = async (
    req: Request,
    res: Response
) => {
    try {
        const driverId = req.user?.userId;
        const trip = await Trip.findAll({
            where: {
                driverId: driverId,
                status: "REQUESTED"
            }
        });

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }
        return res.status(200).json({ trip });
    } catch (error) {
        console.error("Error getting trip request:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * =================================
 * DRIVER CONFIRMS PASSENGER
 * (ONLY DRIVER-POSTED TRIPS)
 * =================================
 */
export const confirmTripController = async (
    req: Request,
    res: Response
) => {
    try {
        const driverId = req.user?.userId;
        if (!driverId) return res.status(401).json({ message: "Unauthorized" });
        const { id } = req.params;

        const trip = await Trip.findByPk(id);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        if (trip.dataValues.tripMode !== "DRIVER_POSTED") {
            return res.status(400).json({ message: "Invalid trip mode" });
        }

        if (trip.dataValues.driverId !== driverId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (trip.dataValues.status !== "REQUESTED") {
            return res.status(400).json({ message: "Trip not in requested state" });
        }
        const otp = generateOtp();
        const hashedOtp = brcypt.hashSync(otp, 10);
        await trip.update({
            otp: hashedOtp,
            otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
            otpVerified: false,
            status: "CONFIRMED",
            driverId: driverId
        });

        console.log("Generated OTP for trip confirmation:", otp);

        // Notify passenger about confirmation and OTP
        if (trip.dataValues.passengerId) {
            await notifyRideAccepted(trip.dataValues.passengerId, {
                tripId: trip.dataValues.id,
                driverId: driverId,
                status: "CONFIRMED"
            });

            await notifyOtpGenerated(trip.dataValues.passengerId, {
                tripId: trip.dataValues.id,
                otp: otp
            });
        }

        return res.status(200).json({
            message: "Trip confirmed successfully",
            trip,
        });
    } catch (error) {
        console.error("Error confirming trip:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const verifyOtpController = async (
    req: Request,
    res: Response
) => {
    try {
        const driverId = req.user?.userId;
        if (!driverId) return res.status(401).json({ message: "Unauthorized" });
        const { id } = req.params;
        const { otp } = req.body;
        const trip = await Trip.findByPk(id);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        if (trip.dataValues.driverId !== driverId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (trip.dataValues.status !== "CONFIRMED") {
            return res.status(400).json({ message: "Trip not in confirmed state" });
        }

        const isOtpValid = brcypt.compareSync(otp, trip.dataValues.otp);
        if (!isOtpValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        await trip.update({ otpVerified: true, status: "ONGOING" });

        // Notify passenger that ride has started
        if (trip.dataValues.passengerId) {
            await notifyRideStarted(trip.dataValues.passengerId, {
                tripId: trip.dataValues.id,
                startTime: new Date()
            });
        }

        return res.status(200).json({
            message: "OTP verified successfully",
            trip,
        });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * =====================
 * DRIVER CANCEL TRIP
 * =====================
 */
export const cancelTripController = async (
    req: Request,
    res: Response
) => {
    try {
        const driverId = req.user?.userId;
        if (!driverId) return res.status(401).json({ message: "Unauthorized" });
        const { id } = req.params;

        const trip = await Trip.findByPk(id);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        if (trip.dataValues.driverId !== driverId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (!["OPEN", "REQUESTED", "CONFIRMED"].includes(trip.dataValues.status)) {
            return res.status(400).json({ message: "Trip cannot be cancelled" });
        }

        await trip.update({ status: "CANCELLED" });

        // Notify passenger (if assigned)
        if (trip.dataValues.passengerId) {
            await notifyRideCancelled(trip.dataValues.passengerId, {
                tripId: trip.dataValues.id,
                reason: "Driver cancelled the trip"
            });
        }

        return res.status(200).json({
            message: "Trip cancelled successfully",
            trip,
        });
    } catch (error) {
        console.error("Error cancelling trip:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * =====================
 * DRIVER COMPLETE TRIP
 * =====================
 */
export const completeTripController = async (
    req: Request,
    res: Response
) => {
    try {
        const driverId = req.user?.userId;
        if (!driverId) return res.status(401).json({ message: "Unauthorized" });
        const { id } = req.params;

        const trip = await Trip.findByPk(id);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        if (trip.dataValues.driverId !== driverId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (trip.dataValues.status !== "ONGOING") {
            return res.status(400).json({ message: "Only confirmed trips can be completed" });
        }

        await trip.update({ status: "COMPLETED" });

        // Notify passenger
        if (trip.dataValues.passengerId) {
            await notifyRideCompleted(trip.dataValues.passengerId, {
                tripId: trip.dataValues.id,
                price: trip.dataValues.price
            });
        }

        return res.status(200).json({
            message: "Trip completed successfully",
            trip,
        });
    } catch (error) {
        console.error("Error completing trip:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * =====================
 * DRIVER DELETE OPEN TRIP
 * =====================
 */
export const deleteTripController = async (
    req: Request,
    res: Response
) => {
    try {
        const driverId = req.user?.userId;
        const { id } = req.params;

        const trip = await Trip.findByPk(id);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        if (trip.dataValues.driverId !== driverId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (trip.dataValues.status !== "OPEN") {
            return res.status(400).json({ message: "Only OPEN trips can be deleted" });
        }

        await trip.destroy();

        // TODO: Dashboard cleanup event
        // eventBus.publish("TRIP_DELETED", {
        //     tripId: id,
        //     driverId,
        // });

        return res.status(200).json({
            message: "Trip deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting trip:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
