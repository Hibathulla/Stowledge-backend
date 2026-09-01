import jwt, { type JwtPayload } from "jsonwebtoken";

export type AuthTokenPayload = JwtPayload & {
  id: number;
  iat: number;
};

export const verifyJWT = (token: string): AuthTokenPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const decoded = jwt.verify(token, secret);

  return decoded as AuthTokenPayload;
};
