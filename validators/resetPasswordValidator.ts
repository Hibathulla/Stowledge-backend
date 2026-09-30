import { z } from "zod";

export const resetPasswordValidator = z
  .object({
    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters long"),
    passwordConfirm: z
      .string({ error: "Password confirmation is required" })
      .min(8, "Password confirmation must be at least 8 characters long"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Password and confirm password must match",
    // path: ["passwordConfirm"],
  });
