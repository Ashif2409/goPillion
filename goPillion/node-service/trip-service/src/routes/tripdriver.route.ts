
import { Router } from "express";
import {
    createTripDriverController,
    getOpenTripsController,
    getTripByIdController,
    getMyTripsDriverController,
    sendRequestController,
    getTripRequestIdController,
    confirmTripController,
    verifyOtpController,
    cancelTripController,
    completeTripController,
    deleteTripController,
} from "../controller/tripdriver.controller";
import { driverAuthMiddleware } from "../middleware/driverAuth.middleware";
import { driverKycVerifiedMiddleware } from "../middleware/driverKycStatus.middleware";

const router = Router();

/**
 * Driver posts a trip
 */
router.post(
    "/",
    driverAuthMiddleware,
    driverKycVerifiedMiddleware,
    createTripDriverController
);

/**
 * Driver dashboard
 * Open passenger-posted trips (filtered later via search service)
 */
router.get(
    "/open",
    driverAuthMiddleware,
    getOpenTripsController
);


/**
 * Get my trips
 */
router.get(
    "/",
    driverAuthMiddleware,
    driverKycVerifiedMiddleware,
    getMyTripsDriverController
);

/**
 * Get trip details
 */
router.get(
    "/:id",
    driverAuthMiddleware,
    getTripByIdController
);

/**
 * Driver requests passenger-posted trip
 */
router.post(
    "/:id/request",
    driverAuthMiddleware,
    driverKycVerifiedMiddleware,
    sendRequestController
);

router.get(
    "/requests",
    driverAuthMiddleware,
    driverKycVerifiedMiddleware,
    getTripRequestIdController
)

/**
 * Driver confirms passenger on driver-posted trip
 */
router.put(
    "/:id/confirm",
    driverAuthMiddleware,
    driverKycVerifiedMiddleware,
    confirmTripController
);


router.put(
    "/:id/verify-otp",
    driverAuthMiddleware,
    driverKycVerifiedMiddleware,
    verifyOtpController 
)
/**
 * Driver cancels a trip
 */
router.put(
    "/:id/cancel",
    driverAuthMiddleware,
    driverKycVerifiedMiddleware,
    cancelTripController
);

/**
 * Driver marks trip as completed
 */
router.put(
    "/:id/complete",
    driverAuthMiddleware,
    driverKycVerifiedMiddleware,
    completeTripController
);

/**
 * Driver deletes own OPEN trip
 */
router.delete(
    "/:id",
    driverAuthMiddleware,
    driverKycVerifiedMiddleware,
    deleteTripController
);

export default router;

export const driverTripRouter = router;