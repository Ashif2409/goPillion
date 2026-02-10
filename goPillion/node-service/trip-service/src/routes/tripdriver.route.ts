
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
 * @swagger
 * /api/driver/trip:
 *   post:
 *     summary: Driver posts a new trip
 *     tags: [Trip - Driver]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Trip'
 *     responses:
 *       201:
 *         description: Trip created successfully
 *       403:
 *         description: KYC not verified
 */
router.post(
    "/",
    driverAuthMiddleware,
    driverKycVerifiedMiddleware,
    createTripDriverController
);

/**
 * @swagger
 * /api/driver/trip/open:
 *   get:
 *     summary: Get open passenger-posted trips
 *     tags: [Trip - Driver]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of open trips
 */
router.get(
    "/open",
    driverAuthMiddleware,
    getOpenTripsController
);


/**
 * @swagger
 * /api/driver/trip:
 *   get:
 *     summary: Get driver's trips
 *     tags: [Trip - Driver]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of driver's trips
 */
router.get(
    "/",
    driverAuthMiddleware,
    driverKycVerifiedMiddleware,
    getMyTripsDriverController
);

/**
 * @swagger
 * /api/driver/trip/{id}:
 *   get:
 *     summary: Get trip details by ID
 *     tags: [Trip - Driver]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trip details
 *       404:
 *         description: Trip not found
 */
router.get(
    "/:id",
    driverAuthMiddleware,
    getTripByIdController
);

/**
 * @swagger
 * /api/driver/trip/{id}/request:
 *   post:
 *     summary: Driver requests a passenger-posted trip
 *     tags: [Trip - Driver]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Request sent successfully
 */
router.post(
    "/:id/request",
    driverAuthMiddleware,
    driverKycVerifiedMiddleware,
    sendRequestController
);

/**
 * @swagger
 * /api/driver/trip/requests:
 *   get:
 *     summary: Get all trip requests for driver
 *     tags: [Trip - Driver]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of trip requests
 */
router.get(
    "/requests",
    driverAuthMiddleware,
    driverKycVerifiedMiddleware,
    getTripRequestIdController
)

/**
 * @swagger
 * /api/driver/trip/{id}/confirm:
 *   put:
 *     summary: Driver confirms passenger on driver-posted trip
 *     tags: [Trip - Driver]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trip confirmed
 */
router.put(
    "/:id/confirm",
    driverAuthMiddleware,
    driverKycVerifiedMiddleware,
    confirmTripController
);


/**
 * @swagger
 * /api/driver/trip/{id}/verify-otp:
 *   put:
 *     summary: Driver verifies OTP to start trip
 *     tags: [Trip - Driver]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp]
 *             properties:
 *               otp: { type: string, example: "123456" }
 *     responses:
 *       200:
 *         description: OTP verified, trip started
 */
router.put(
    "/:id/verify-otp",
    driverAuthMiddleware,
    driverKycVerifiedMiddleware,
    verifyOtpController
)
/**
 * @swagger
 * /api/driver/trip/{id}/cancel:
 *   put:
 *     summary: Driver cancels a trip
 *     tags: [Trip - Driver]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trip cancelled
 */
router.put(
    "/:id/cancel",
    driverAuthMiddleware,
    driverKycVerifiedMiddleware,
    cancelTripController
);

/**
 * @swagger
 * /api/driver/trip/{id}/complete:
 *   put:
 *     summary: Driver marks trip as completed
 *     tags: [Trip - Driver]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trip completed
 */
router.put(
    "/:id/complete",
    driverAuthMiddleware,
    driverKycVerifiedMiddleware,
    completeTripController
);

/**
 * @swagger
 * /api/driver/trip/{id}:
 *   delete:
 *     summary: Driver deletes own OPEN trip
 *     tags: [Trip - Driver]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trip deleted
 */
router.delete(
    "/:id",
    driverAuthMiddleware,
    driverKycVerifiedMiddleware,
    deleteTripController
);

export default router;

export const driverTripRouter = router;