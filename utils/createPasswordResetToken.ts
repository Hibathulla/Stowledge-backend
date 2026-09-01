import { randomBytes, createHash } from "node:crypto";
import { prisma } from "../lib/prisma";

export const createPasswordResetToken = async (id: number | undefined) => {
  const resetTokenHash = randomBytes(32).toString("hex");
  const resetToken = createHash("sha256").update(resetTokenHash).digest("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  //   console.log(resetToken, resetTokenHash, "testTokens");

  await prisma.user.update({
    where: { id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpires: expiresAt,
    },
  });
  return resetTokenHash;
};
