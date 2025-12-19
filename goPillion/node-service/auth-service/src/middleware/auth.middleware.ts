import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Tokens from "../models/BlockToken";
dotenv.config();


export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async(req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const isTokenExist=await Tokens.findOne({where:{token}});
    if(isTokenExist){
      return  res.status(401).json({ success: false, message: "Unauthorized: Token is blocked. Please login again." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded; // attach user data to req

    return next();
  } catch (error) {
    console.error("JWT Error:", error);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
