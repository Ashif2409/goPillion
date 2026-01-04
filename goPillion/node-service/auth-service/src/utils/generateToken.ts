import jwt, { SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config();


export const generateAccessToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN as any) || "15m",
  };

  return jwt.sign({ id, role }, secret, options);
};

export const generateRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not defined in environment variables");
  }

  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as any) || "7d",
  };

  return jwt.sign({ id: userId }, secret, options);
};