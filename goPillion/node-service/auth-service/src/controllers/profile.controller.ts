import { Request, Response } from "express";
import User from "../models/User";
import Tokens from "../models/BlockToken";


export const getProfileController = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { id } = user;
        const userData = await User.findByPk(id);

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.json({ success: true, profile: userData });
    } catch (error) {
        console.error("Get profile error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateProfileController = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { name, mobile, role } = req.body;

        // Fetch user
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // CONDITION: If current name is null/empty and user didn't send a name
        if ((!user.name || user.name.trim() === "") && (!name || name.trim() === "")) {
            return res.status(400).json({
                success: false,
                message: "Name is required",
            });
        }

        // Update fields
        if (name) user.set({ name });
        if (mobile) user.set({ mobile });

        if (role) {
            const validRoles = ["USER", "DRIVER"];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ success: false, message: "Invalid role" });
            }
            user.set({ role });
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        });

    } catch (error: any) {
        console.error("Update profile error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const logoutController = async (req: Request, res: Response):Promise<any> => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: "No refresh token provided" });
        }
        // Clear refresh token cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        await Tokens.create({
              token: refreshToken 
        });
        
        return res.json({ success: true, message: "Logged out successfully" });
    } catch (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};