import { randomBytes, createHash } from "node:crypto";
import { prisma } from "../lib/prisma";

export const createPasswordResetToken = async (token?: string) => {
  const resetTokenHash = randomBytes(32).toString("hex");
  const resetToken = createHash("sha256")
    .update(token || resetTokenHash)
    .digest("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  return { resetTokenHash, resetToken, expiresAt };
};
