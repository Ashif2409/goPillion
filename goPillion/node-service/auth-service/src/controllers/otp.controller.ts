import { Request, Response } from "express";
import { generateOTP } from '../utils/otpUtils';
import { sendOTP } from '../services/otpServices';
import UserOTP from "../models/UserOTP";
import User from "../models/User";
import bcrypt from 'bcrypt';
import { generateRefreshToken, generateToken } from "../utils/generateToken";


export const sendOTPController = async (req: Request, res: Response) => {
    try {
        const { mobile } = req.body;

        if (!mobile) {
            return res.status(400).json({ message: "Mobile required" });
        }

        // 1. Generate OTP
        const otp = generateOTP();
        const hashedOtp = await bcrypt.hash(otp, 10);

        // 2. Delete old OTP if exists
        await UserOTP.destroy({ where: { mobile } });

        // 3. Save new OTP
        await UserOTP.create({
            mobile,
            otp: hashedOtp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
            verified: false,
        });

        // 4. Send OTP via Twilio
        await sendOTP(mobile, otp);

        return res.json({ message: "OTP sent successfully" });

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
            where: { mobile },
            order: [["createdAt", "DESC"]]
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

        //  Create tokens
        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken(user.id);

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


