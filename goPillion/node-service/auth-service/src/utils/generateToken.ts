import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const generateToken = (id:string) => {
  return jwt.sign(
    {
      id
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "30d",
  });
};
