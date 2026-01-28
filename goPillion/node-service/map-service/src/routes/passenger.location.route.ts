import express from 'express';
import { createPassengerLocationController,getPassengerLocationController, updatePassengerLocationController, removePassengerLocationController } from '../controllers/passenger.location.controller';
const router = express.Router();


router.post('/',createPassengerLocationController);
router.put('/',updatePassengerLocationController);
router.delete('/',removePassengerLocationController);
router.get('/',getPassengerLocationController);

export const passengerRoutes = router;