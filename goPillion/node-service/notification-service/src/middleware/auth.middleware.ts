// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyTokenWithAuthService } from "./verifytoken";

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

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    // console.log("Verifying token in auth middleware:", token);
    req.user = await verifyTokenWithAuthService(token);
    // console.log("Token verified, user:", req.user);
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};
