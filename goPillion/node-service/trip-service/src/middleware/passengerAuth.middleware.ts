import axios from 'axios';
import { Request, Response, NextFunction } from 'express';


import "express";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: string;
            };
        }
    }
}


export const passengerAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token missing' });
        }
        console.log("auth service url driver-service/auth.middleware.ts- ", process.env.AUTH_SERVICE_URL)

        // Validate token with Auth Service
        const response = await axios.post(
            `${process.env.AUTH_SERVICE_URL}/verify-token`,
            {},
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );


        if (response.status === 200) {
            // FIXED: Correct destructuring - role is inside user object
            const { user } = response.data;
            const { userId, role } = user;

            if (role !== 'USER') {
                return res.status(403).json({ message: 'Forbidden: Insufficient role' });
            }

            req.user = { userId, role }; // Attach user info to request
            next();
        } else {
            return res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error: Error | any) {
        console.error('Authentication error:', error);
        return res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
}

