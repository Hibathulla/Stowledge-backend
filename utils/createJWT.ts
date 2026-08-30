import type { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./appError";

export const createJWT = (id: number, next: NextFunction): string | undefined => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    next(new AppError("JWT_SECRET is not defined", 400));
    return;
  }

  return jwt.sign({ id }, secret, {
    expiresIn: "90d",
  });
};
