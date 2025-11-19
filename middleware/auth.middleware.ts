import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../error/custom-error-hendler.js";

interface JWTPayload {
  id: number;
  email: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError("Token topilmadi", 401);
    }

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET_KEY || "") as JWTPayload;

    (req as any).user = decoded;
    next();
  } catch (error) {
    throw new AppError("Token noto'g'ri yoki muddati tugagan", 401);
  }
};
