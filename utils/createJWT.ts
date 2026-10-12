import type { NextFunction } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { AppError } from "./appError";

export const createJWT = (
  id: number,
  next: NextFunction,
  type: "access" | "refresh"
): string | undefined => {
  const secret = process.env.JWT_SECRET;
  const refreshExpiresIn = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN ?? "5m";
  const accessExpiresIn = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ?? "5h";

  if (!secret) {
    next(new AppError("JWT_SECRET is not defined", 400));
    return;
  }

  return jwt.sign({ id, tokenType: type }, secret, {
    expiresIn:
      type === "access"
        ? (accessExpiresIn as SignOptions["expiresIn"])
        : (refreshExpiresIn as SignOptions["expiresIn"]),
  });
};
