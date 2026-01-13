import { Router } from "express";
import {
    createTripPassengerController,
    getMyTripsPassengerController,
    getTripByIdPassengerController,
    getOpenTripsPassengerController,
    cancelTripPassengerController,
    confirmDriverController,
    requestDriverController,
    deleteTripPassengerController,
    getTripRequestIdController,
} from "../controller/trippassenger.controller";
import { passengerAuthMiddleware } from "../middleware/passengerAuth.middleware";

const router = Router();

/**
 * Passenger posts a trip
 * (PASSENGER_POSTED)
 */
router.post(
    "/",
    passengerAuthMiddleware,
    createTripPassengerController
);

/**
 * Passenger dashboard
 * Get all trips created by passenger
 */
router.get(
    "/",
    passengerAuthMiddleware,
    getMyTripsPassengerController
);

/**
 * Get Open trips src to dest created by driver 
 */
router.get(
    "/open",
    passengerAuthMiddleware,
    getOpenTripsPassengerController
);
/**
 * Get trip details
 */
router.get(
    "/:id",
    passengerAuthMiddleware,
    getTripByIdPassengerController
);

/**
 * Passenger confirms a driver request
 * Triggered when driver requested passenger-posted trip
 */
router.put(
    "/:id/confirm",
    passengerAuthMiddleware,
    confirmDriverController
);

router.get(
    "/:id/requests",
    passengerAuthMiddleware,
    getTripRequestIdController
)
/**
 * Passenger cancels a trip
 */
router.put(
    "/:id/cancel",
    passengerAuthMiddleware,
    cancelTripPassengerController
);

/**
 * Passenger requests a driver
 */
router.post(
    "/:id/request",
    passengerAuthMiddleware,
    requestDriverController
);

/**
 * Passenger deletes own OPEN trip
 */
router.delete(
    "/:id",
    passengerAuthMiddleware,
    deleteTripPassengerController
);

export default router;
export const passengerTripRouter = router;
