import express from "express";
import { getDistanceController, getNearbyController, getRouteDetailsController } from '../controllers/map.controller'

const router = express.Router();

/**
 * @swagger
 * /api/maps/distance:
 *   post:
 *     summary: Get distance and duration
 *     tags: [Maps]
 *     responses:
 *       200: { description: Success }
 */
router.post("/distance", getDistanceController);

/**
 * @swagger
 * /api/maps/nearby:
 *   post:
 *     summary: Get nearby drivers
 *     tags: [Maps]
 *     responses:
 *       200: { description: Success }
 */
router.post("/nearby", getNearbyController);

/**
 * @swagger
 * /api/maps/routeDetails:
 *   get:
 *     summary: Get route details
 *     tags: [Maps]
 *     responses:
 *       200: { description: Success }
 */
router.get("/routeDetails", getRouteDetailsController);

export const mapRoutes = router;