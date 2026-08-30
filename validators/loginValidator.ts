import { z } from "zod";

export const loginValidator = z.object({
  email: z
    .string({ error: "Email is required" })
    .min(1, "Email is required")
    .email("Please provide a valid email address"),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters long"),
});
