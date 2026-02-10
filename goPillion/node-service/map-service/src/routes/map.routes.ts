import express from "express";
import {getDistanceController , getNearbyController, getRouteDetailsController} from '../controllers/map.controller'

const router = express.Router();



router.post("/distance",getDistanceController);
router.post("/nearby",getNearbyController);
router.get("/routeDetails",getRouteDetailsController);

export const mapRoutes = router;