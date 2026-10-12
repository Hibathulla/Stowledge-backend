import type { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./appError";

export const createJWT = (
  id: number,
  next: NextFunction,
  type: "access" | "refresh"
): string | undefined => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    next(new AppError("JWT_SECRET is not defined", 400));
    return;
  }

  return jwt.sign({ id, tokenType: type }, secret, {
    expiresIn: type === "access" ? "2m" : "10m",
  });
};
