import jwt, { type JwtPayload } from "jsonwebtoken";

export type AuthTokenPayload = JwtPayload & {
  id: number;
  iat: number;
  tokenType: "access" | "refresh";
};

export const verifyJWT = (
  token: string,
  expectedType: AuthTokenPayload["tokenType"]
): AuthTokenPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const decoded = jwt.verify(token, secret);

  if (typeof decoded === "string" || decoded.tokenType !== expectedType || typeof decoded.id !== "number") {
    throw new Error("Invalid token");
  }

  return decoded as AuthTokenPayload;
};
