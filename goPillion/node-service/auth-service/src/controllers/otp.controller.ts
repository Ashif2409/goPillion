import { Request, Response } from "express";
import { generateOTP } from '../utils/otpUtils';
import { sendOTP } from '../services/otpServices';
import UserOTP from "../models/UserOTP";
import User from "../models/User";
import bcrypt from 'bcrypt';
import { generateRefreshToken, generateAccessToken } from "../utils/generateToken";


export const sendOTPController = async (req: Request, res: Response) => {
    try {
        const { mobile } = req.body;

        if (!mobile) {
            return res.status(400).json({ message: "Mobile required" });
        }

        const otp = generateOTP();
        const hashedOtp = await bcrypt.hash(otp, 10);

        await UserOTP.destroy({ where: { mobile } });

        await UserOTP.create({
            mobile,
            otp: hashedOtp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            verified: false,
        });

        // 👇👇 Only send SMS in production
        if (process.env.NODE_ENV === "production") {
            await sendOTP(mobile, otp);
        } else {
            console.log("⚠️ OTP (DEV MODE):", otp);
        }

        return res.json({
            message: process.env.NODE_ENV === "production"
                ? "OTP sent successfully"
                : `OTP for testing: ${otp}` // optional, dev-only
        });

    } catch (err) {
        console.error("OTP send error:", err);
        return res.status(500).json({ message: "Failed to send OTP" });
    }
};


export const verifyOTPController = async (req: Request, res: Response) => {
    let userCreated = false;
    let user: User | null = null;
    let otpRecord: UserOTP | null = null;

    try {
        const { mobile, otp } = req.body;

        if (!mobile || !otp) {
            return res.status(400).json({ success: false, message: "Mobile and OTP are required" });
        }

        if (!/^\d+$/.test(otp)) {
            return res.status(400).json({ success: false, message: "Invalid OTP format" });
        }

        otpRecord = await UserOTP.findOne({
            where: { mobile }
        });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "OTP not found" });
        }

        if (otpRecord.verified) {
            return res.status(400).json({ success: false, message: "OTP already verified" });
        }

        if (new Date() > otpRecord.expiresAt) {
            await otpRecord.destroy();
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        const isMatch = await bcrypt.compare(otp, otpRecord.otp);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        otpRecord.verified = true;
        await otpRecord.save();

        user = await User.findOne({ where: { mobile } });

        if (!user) {
            user = await User.create({ mobile, role: "USER" });
            userCreated = true;
        }

        const userId = user.dataValues.id;

        if (!userId) {
            return res.status(500).json({ success: false, message: "User ID undefined" });
        }
        if (userId === undefined) {
            return res.status(500).json({ success: false, message: "User ID undefined" });
        }
        const accessToken = generateAccessToken(userId, user.dataValues.role);
        const refreshToken = generateRefreshToken(userId);

        //  Send refresh token as secure cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        return res.json({
            success: true,
            accessToken,
            refreshToken,
            message: "OTP verified successfully"
        });

    } catch (err) {
        console.error("OTP verification error:", err);

        try {
            if (userCreated && user) await user.destroy();
            if (otpRecord && otpRecord.verified) {
                otpRecord.verified = false;
                await otpRecord.save();
            }
        } catch (rollbackErr) {
            console.error("Rollback error:", rollbackErr);
        }

        return res.status(500).json({ success: false, message: "Failed to verify OTP" });
    }
};


