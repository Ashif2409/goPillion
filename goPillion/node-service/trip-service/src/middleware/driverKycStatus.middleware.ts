import { Request, Response, NextFunction } from "express";
import axios from "axios";

export const driverKycVerifiedMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const driverId = req.user?.userId;

        if (!driverId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token missing' });
        }
        // 🔁 Call driver-service (or kyc service)
        const response = await axios.get(
                   `${process.env.DRIVER_SERVICE_URL}/driver/kyc/status-driver/${driverId}`
               );

        const { kycStatus } = response.data;

        if (kycStatus !== "VERIFIED") {
            return res.status(403).json({
                message: "KYC not completed. Complete KYC to create trips.",
                kycStatus,
            });
        }

        next();
    } catch (error: any) {
        console.error("KYC middleware error:", {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            data: error.response?.data,
        });

        return res.status(500).json({
            message: "Failed to verify KYC status",
        });
    }

};
