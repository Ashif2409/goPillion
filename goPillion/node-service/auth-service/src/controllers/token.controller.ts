import { Request, Response } from 'express';
import Tokens from '../models/BlockToken';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { generateAccessToken } from '../utils/generateToken';
import dotenv from 'dotenv'
dotenv.config();


export const generateRefreshTokenController = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401);

    const isBlocked = await Tokens.findOne({ where: { token } });
    if (isBlocked) return res.sendStatus(403);
    console.log(process.env.JWT_REFRESH_SECRET)
    const decoded: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.sendStatus(404);
    const accessToken = generateAccessToken(user.id, user.role);

    return res.json({
      success: true,
      accessToken,
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    return res.status(500).json({ success: false, message: "Failed to generate access token" });
  }
};

export const verifyTokenController = async (
  req: Request,
  res: Response
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];
    // console.log(process.env.JWT_SECRET)
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

    // // Ensure ACCESS token only
    // if (decoded.type !== "ACCESS") {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Invalid token type",
    //   });
    // }
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "role"],
    });


    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not authorized",
      });
    }

    return res.json({
      success: true,
      user: {
        userId: user.dataValues.id,
        role: user.dataValues.role,
      },
    });
  } catch (err) {
    console.log(err)
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};