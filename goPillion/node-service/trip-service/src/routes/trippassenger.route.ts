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
 * @swagger
 * /api/passenger/trip:
 *   post:
 *     summary: Passenger posts a new trip
 *     tags: [Trip - Passenger]
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
 */
router.post(
    "/",
    passengerAuthMiddleware,
    createTripPassengerController
);

/**
 * @swagger
 * /api/passenger/trip:
 *   get:
 *     summary: Get all trips created by passenger
 *     tags: [Trip - Passenger]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of passenger's trips
 */
router.get(
    "/",
    passengerAuthMiddleware,
    getMyTripsPassengerController
);

/**
 * @swagger
 * /api/passenger/trip/open:
 *   get:
 *     summary: Get open driver-posted trips
 *     tags: [Trip - Passenger]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of open trips
 */
router.get(
    "/open",
    passengerAuthMiddleware,
    getOpenTripsPassengerController
);
/**
 * @swagger
 * /api/passenger/trip/{id}:
 *   get:
 *     summary: Get trip details by ID
 *     tags: [Trip - Passenger]
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
 */
router.get(
    "/:id",
    passengerAuthMiddleware,
    getTripByIdPassengerController
);

/**
 * @swagger
 * /api/passenger/trip/{id}/confirm:
 *   put:
 *     summary: Passenger confirms a driver request
 *     tags: [Trip - Passenger]
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
 *         description: Driver request confirmed
 */
router.put(
    "/:id/confirm",
    passengerAuthMiddleware,
    confirmDriverController
);

/**
 * @swagger
 * /api/passenger/trip/{id}/requests:
 *   get:
 *     summary: Get all driver requests for a passenger-posted trip
 *     tags: [Trip - Passenger]
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
 *         description: List of driver requests
 */
router.get(
    "/:id/requests",
    passengerAuthMiddleware,
    getTripRequestIdController
)
/**
 * @swagger
 * /api/passenger/trip/{id}/cancel:
 *   put:
 *     summary: Passenger cancels a trip
 *     tags: [Trip - Passenger]
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
    passengerAuthMiddleware,
    cancelTripPassengerController
);

/**
 * @swagger
 * /api/passenger/trip/{id}/request:
 *   post:
 *     summary: Passenger requests a driver (for driver-posted trip)
 *     tags: [Trip - Passenger]
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
 *         description: Request sent to driver
 */
router.post(
    "/:id/request",
    passengerAuthMiddleware,
    requestDriverController
);

/**
 * @swagger
 * /api/passenger/trip/{id}:
 *   delete:
 *     summary: Passenger deletes own OPEN trip
 *     tags: [Trip - Passenger]
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
    passengerAuthMiddleware,
    deleteTripPassengerController
);

export default router;
export const passengerTripRouter = router;
