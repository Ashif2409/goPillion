import { Request, Response } from "express";
import { Trip } from "../model/trip.model";
import { Op, Sequelize } from "sequelize";
import { generateOtp } from "../utils/generateOtp";
import brcypt from "bcrypt";
import {
    notifyRideRequested,
    notifyRideAccepted,
    notifyOtpGenerated,
    notifyRideCancelled
} from "../service/trip.notification.service";
import { calculateRidePrice } from "../service/pricing.service";
import { getRouteFromMapService } from "../service/map.http.service";
/**
 * Passenger posts a trip (PASSENGER_POSTED)
 */
export const createTripPassengerController = async (req: Request, res: Response) => {
    try {
        const passengerId = req.user?.userId;
        const {
            srcLat, srcLng, srcName,
            destLat, destLng, destName,
            tripType, earliestStartTime, latestStartTime,
            vehicleType // Passenger can request "SCOOTY" specifically
        } = req.body;

        if (!srcLat || !srcLng || !destLat || !destLng || !tripType || !earliestStartTime) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // 1. GET ROUTE DETAILS
        let routeData;
        try {
            routeData = await getRouteFromMapService(srcLat, srcLng, destLat, destLng);
        } catch (err) {
            console.error("Map Service Failed:", err);
            return res.status(500).json({ message: "Could not calculate route." });
        }

        // 2. CALCULATE PRICE
        // For passengers, this is the "Estimated Fare"
        const calculated = calculateRidePrice(
            routeData.distanceKm,
            routeData.durationMin,
            vehicleType || "BIKE"
        );

        // Time Validation
        let earliest = new Date(earliestStartTime);
        let latest: Date;
        if (tripType === "IMMEDIATE") {
            latest = new Date(earliest.getTime() + 15 * 60 * 1000);
        } else {
            if (!latestStartTime) return res.status(400).json({ message: "latestStartTime required" });
            latest = new Date(latestStartTime);
            if (latest <= earliest) return res.status(400).json({ message: "Time validation failed" });
        }

        // 3. CREATE TRIP
        const trip = await Trip.create({
            srcLat, srcLng, srcName,
            destLat, destLng, destName,
            earliestStartTime: earliest,
            latestStartTime: latest,
            passengerId,
            tripType,
            tripMode: "PASSENGER_POSTED",
            status: "OPEN",

            // NEW FIELDS
            vehicleType: vehicleType || "BIKE",
            distance: routeData.distanceKm,
            duration: routeData.durationMin,
            routePolyline: routeData.polyline,
            price: calculated.price // Set the standard calculated price
        });

        // Remove sensitive/large fields before returning to client
        const tripData: any = trip.toJSON ? trip.toJSON() : trip;
        delete tripData.routePolyline;
        delete tripData.otp;
        delete tripData.otpExpiresAt;

        return res.status(201).json({
            message: "Trip created successfully",
            trip: tripData,
            estimatedPrice: calculated.price,
            priceBreakdown: calculated.breakdown
        });

    } catch (error) {
        console.error("Passenger create trip error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Passenger dashboard
 * Get all trips created by this passenger
 */
export const getMyTripsPassengerController = async (
    req: Request,
    res: Response
) => {
    try {
        const passengerId = req.user?.userId;

        const trips = await Trip.findAll({
            where: { passengerId },
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({ trips });
    } catch (error) {
        console.error("Get passenger trips error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Passenger searches OPEN DRIVER_POSTED trips
 * (actual filtering should be done by Search Service)
 */
export const getOpenTripsPassengerController = async (req: Request, res: Response) => {
    try {
        const { srcLat, srcLng, radiusKm = 5 } = req.query;

        if (!srcLat || !srcLng) {
            return res.status(400).json({ message: "Pickup location required" });
        }

        const lat = Number(srcLat);
        const lng = Number(srcLng);

        const trips = await Trip.findAll({
            attributes: {
                include: [
                    [
                        // Math logic remains the same (with quotes fixed previously)
                        Sequelize.literal(`(
                            6371 * acos(
                                cos(radians(${lat})) *
                                cos(radians("srcLat")) * cos(radians("srcLng") - radians(${lng})) +
                                sin(radians(${lat})) *
                                sin(radians("srcLat"))
                            )
                        )`),
                        'proximity' // <--- CHANGED: Renamed from 'distance' to 'proximity'
                    ]
                ]
            },
            where: {
                status: "OPEN",
                tripMode: "DRIVER_POSTED",
                driverId: { [Op.ne]: null },
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
                // Sort by the new alias 'proximity'
                [Sequelize.literal('proximity'), 'ASC'] 
            ],
        });

        return res.status(200).json({ trips });
    } catch (error) {
        console.error("Get open trips error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Get trip details (Passenger view)
 */
export const getTripByIdPassengerController = async (
    req: Request,
    res: Response
) => {
    try {
        const trip = await Trip.findAll({
            where: {
                id: req.params.id,
                passengerId: req.user?.userId
            }
        });

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        return res.status(200).json({ trip });
    } catch (error) {
        console.error("Get trip error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Passenger requests a driver-posted trip
 */
export const requestDriverController = async (
    req: Request,
    res: Response
) => {
    try {
        const passengerId = req.user?.userId;
        if (!passengerId) return res.status(401).json({ message: "Unauthorized" });
        const { id } = req.params;

        const trip = await Trip.findByPk(id);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        if (trip.dataValues.tripMode !== "DRIVER_POSTED") {
            return res.status(400).json({ message: "Trip is not driver-posted" });
        }

        if (trip.dataValues.status !== "OPEN") {
            return res.status(400).json({ message: "Trip not open" });
        }

        await trip.update({
            passengerId,
            status: "REQUESTED",
        });

        /**
         * TODO:
         * - Notify driver via NOTIFICATION SERVICE
         */
        // Notify driver
        if (trip.dataValues.driverId) {
            await notifyRideRequested(trip.dataValues.driverId, {
                tripId: trip.dataValues.id,
                senderId: passengerId,
                srcName: trip.dataValues.srcName,
                destName: trip.dataValues.destName,
                price: trip.dataValues.price
            });
        }

        return res.status(200).json({
            message: "Driver requested successfully",
            trip,
        });
    } catch (error) {
        console.error("Request driver error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Passenger confirms driver request
 */
export const confirmDriverController = async (
    req: Request,
    res: Response
) => {
    try {
        const passengerId = req.user?.userId;
        if (!passengerId) return res.status(401).json({ message: "Unauthorized" });
        const { id } = req.params;

        const trip = await Trip.findByPk(id);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        if (trip.dataValues.passengerId !== passengerId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (trip.dataValues.status !== "REQUESTED") {
            return res.status(400).json({ message: "Trip not in REQUESTED state" });
        }
        const otp = generateOtp();
        const otpHash = brcypt.hashSync(otp, 10);
        await trip.update({
            status: "CONFIRMED",
            otp: otpHash,
            otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
            otpVerified: false,
        });

        // 🔔 SEND OTP TO PASSENGER (SELF)
        // notificationService.sendOtp(passengerId, otp);
        console.log("Generated OTP for trip confirmation:", otp);

        // Notify driver
        if (trip.dataValues.driverId) {
            await notifyRideAccepted(trip.dataValues.driverId, {
                tripId: trip.dataValues.id,
                passengerId: passengerId,
                status: "CONFIRMED"
            });
        }

        // Send OTP to self (Passenger)
        await notifyOtpGenerated(passengerId, {
            tripId: trip.dataValues.id,
            otp: otp
        });
        return res.status(200).json({
            message: "Driver confirmed successfully",
            trip,
        });
    } catch (error) {
        console.error("Confirm driver error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getTripRequestIdController = async (
    req: Request,
    res: Response
) => {
    try {
        const passengerId = req.user?.userId;
        const { id } = req.params;
        const trip = await Trip.findAll({
            where: {
                id: id,
                passengerId: passengerId,
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
 * Passenger cancels trip
 */
export const cancelTripPassengerController = async (
    req: Request,
    res: Response
) => {
    try {
        const passengerId = req.user?.userId;
        if (!passengerId) return res.status(401).json({ message: "Unauthorized" });
        const trip = await Trip.findByPk(req.params.id);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        if (trip.dataValues.passengerId !== passengerId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (["COMPLETED", "CANCELLED"].includes(trip.dataValues.status)) {
            return res.status(400).json({ message: "Trip cannot be cancelled" });
        }

        await trip.update({ status: "CANCELLED" });

        /**
         * TODO:
         * - Notify driver (if assigned)
         * - Remove from SEARCH SERVICE
         */
        if (trip.dataValues.driverId) {
            await notifyRideCancelled(trip.dataValues.driverId, {
                tripId: trip.dataValues.id,
                reason: "Passenger cancelled the trip"
            });
        }

        return res.status(200).json({
            message: "Trip cancelled successfully",
            trip,
        });
    } catch (error) {
        console.error("Cancel trip error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Passenger deletes own OPEN trip
 */
export const deleteTripPassengerController = async (
    req: Request,
    res: Response
) => {
    try {
        const passengerId = req.user?.userId;
        if (!passengerId) return res.status(401).json({ message: "Unauthorized" });
        const trip = await Trip.findByPk(req.params.id);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        if (trip.dataValues.passengerId !== passengerId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (trip.dataValues.status !== "OPEN") {
            return res.status(400).json({
                message: "Only OPEN trips can be deleted",
            });
        }

        await trip.destroy();

        /**
         * TODO:
         * - Remove from SEARCH SERVICE
         */

        return res.status(200).json({ message: "Trip deleted successfully" });
    } catch (error) {
        console.error("Delete trip error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
