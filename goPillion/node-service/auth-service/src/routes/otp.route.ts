import express from 'express';
import { sendOTPController,verifyOTPController } from '../controllers/otp.controller';

 const router = express.Router();
 
router.get('/status', (req, res) => {
    res.send({ status: 'Auth service is running' });
});

router.post("/request-otp",sendOTPController);
router.post("/verify-otp",verifyOTPController);

export const otpRoutes = router;