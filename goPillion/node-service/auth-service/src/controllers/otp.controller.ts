import { Request, Response } from "express";
import { generateOTP } from '../utils/otpUtils';
import { sendOTP } from '../services/otpServices';
import UserOTP from "../models/UserOTP";
import User from "../models/User";
import bcrypt from 'bcrypt';
import { generateToken } from "../utils/generateToken";


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

        // Validate OTP
        if (typeof otp !== 'string' || !/^\d+$/.test(otp)) {
            return res.status(400).json({ success: false, message: "Invalid OTP format" });
        }

        // Find latest OTP entry
        otpRecord = await UserOTP.findOne({
            where: { mobile },
            order: [['createdAt', 'DESC']]
        });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "OTP not found. Please request a new one." });
        }

        if (otpRecord.verified) {
            return res.status(400).json({ success: false, message: "OTP already verified" });
        }

        if (new Date() > otpRecord.expiresAt) {
            await otpRecord.destroy();
            return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
        }

        if (!otpRecord.otp) {
            return res.status(500).json({ success: false, message: "Server error: Invalid OTP record" });
        }

        const isMatch = await bcrypt.compare(otp, otpRecord.otp);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        // Mark OTP verified
        otpRecord.verified = true;
        await otpRecord.save();

        // Find or create user
        user = await User.findOne({ where: { mobile } });

        if (!user) {
            user = await User.create({ mobile, role: "USER" });
            userCreated = true; // Track newly created user
        }

        const token = generateToken(user);

        return res.json({
            success: true,
            token,
            message: "OTP verified successfully"
        });

    } catch (err:Error|any) {
        console.error("OTP verification error:", err);

        // ROLLBACK LOGIC
        try {
            if (userCreated && user) {
                await user.destroy(); // Delete newly created user
                console.log("Rollback: Deleted user because of error");
            }

            if (otpRecord && otpRecord.verified) {
                otpRecord.verified = false;
                await otpRecord.save();
                console.log("Rollback: OTP marked back to unverified");
            }

        } catch (rollbackErr) {
            console.error("Rollback error:", rollbackErr);
        }

        return res.status(500).json({
            success: false,
            message: "Failed to verify OTP"
        });
    }
};

