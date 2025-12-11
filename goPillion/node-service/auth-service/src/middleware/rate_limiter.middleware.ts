import { NextFunction,Request,Response } from "express";
import rateLimit from "express-rate-limit";

// 1. Per-IP flood protection for OTP
export const otpIPLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req: Request, res: Response) => {
    return res.status(429).json({
      success: false,
      message: "Too many OTP requests from this IP. Try again later.",
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
    
  handler: (req: Request, res: Response) => {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Slow down.",
    });
  },
});


// In-memory store for per-mobile number limits
const otpStore: Record<string, { lastSent: number; count: number; day: string }> = {};

export const otpMobileLimiter = (req: Request, res: Response, next: NextFunction): any => {
  const mobile = req.body.mobile;
  if (!mobile)
    return res.status(400).json({ message: "Mobile number required" });

  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);

  if (!otpStore[mobile]) {
    otpStore[mobile] = { lastSent: 0, count: 0, day: today };
  }

  const record = otpStore[mobile];

  if (record.day !== today) {
    record.count = 0;
    record.day = today;
  }

  // Cooldown: 30 sec
  const cooldown = 30 * 1000;
  if (now - record.lastSent < cooldown) {
    const wait = Math.ceil((cooldown - (now - record.lastSent)) / 1000);
    return res.status(429).json({
      success: false,
      message: `Please wait ${wait}s before requesting another OTP.`
    });
  }

  // Daily limit: 5 OTP
  if (record.count >= 5) {
    return res.status(429).json({
      success: false,
      message: "Daily OTP limit reached. Try tomorrow."
    });
  }

  record.lastSent = now;
  record.count += 1;

  next();
};
